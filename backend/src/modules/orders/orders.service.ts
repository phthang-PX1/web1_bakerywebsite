import jwt from "jsonwebtoken";
import { Prisma, type OrderStatus } from "@prisma/client";
import type { SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/errorHandler";
import { clearCart, getCart } from "../cart/cart.service";
import type { CartIdentity, CartItemResponse } from "../cart/cart.types";
import {
  creditDeliveredOrderLoyaltyInTransaction,
  revokeOrderLoyaltyInTransaction
} from "../loyalty/loyalty.service";
import { emailTransporter } from "../../utils/email";
import { getStaticQrUrl } from "../../utils/payment";
import { sendSms } from "../../utils/sms";
import type {
  OrderCreateInput,
  OrderIdentity,
  OrderListQuery,
  PaymentWebhookInput,
  UpdateOrderStatusInput
} from "./orders.types";

const DELIVERY_SHIPPING_FEE = 0;
const PICKUP_SHIPPING_FEE = 0;
const firstFrontendUrl = env.FRONTEND_URL.split(",")[0].trim();
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TransactionClient = Prisma.TransactionClient;

const toMoney = (value: Prisma.Decimal | number) =>
  Number(Number(value).toFixed(2));

const getTransferContent = (orderId: string) => `DH${orderId}`;

const getActivationUrl = (userId: string) => {
  const token = jwt.sign(
    { userId, purpose: "activation" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "24h" as SignOptions["expiresIn"] }
  );
  const url = new URL("/auth/activate", firstFrontendUrl);
  url.searchParams.set("token", token);
  return url.toString();
};

const getShippingFee = (input: OrderCreateInput) =>
  input.fulfillmentType === "delivery" ? DELIVERY_SHIPPING_FEE : PICKUP_SHIPPING_FEE;

const formatOrderItem = (item: {
  orderItemId: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: Prisma.Decimal;
  quantity: number;
  isCustom: boolean;
  customNote: string | null;
  itemTotal: Prisma.Decimal;
  options: {
    id: string;
    itemId: string;
    optionNameSnapshot: string;
    optionPriceSnapshot: Prisma.Decimal;
  }[];
}) => ({
  orderItemId: item.orderItemId,
  productId: item.productId,
  productNameSnapshot: item.productNameSnapshot,
  unitPriceSnapshot: toMoney(item.unitPriceSnapshot),
  quantity: item.quantity,
  isCustom: item.isCustom,
  customNote: item.customNote,
  itemTotal: toMoney(item.itemTotal),
  options: item.options.map((option) => ({
    id: option.id,
    itemId: option.itemId,
    optionNameSnapshot: option.optionNameSnapshot,
    optionPriceSnapshot: toMoney(option.optionPriceSnapshot)
  }))
});

const formatOrderSummary = (order: {
  orderId: string;
  userId: string | null;
  couponId: string | null;
  recipientName: string;
  phone: string;
  fulfillmentType: "delivery" | "pickup";
  deliveryAddress: string | null;
  deliveryDate: Date;
  deliveryTimeSlot: string;
  subtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  shippingFee: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  paymentMethod: "cash" | "transfer" | "card";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: OrderStatus;
  note: string | null;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  orderId: order.orderId,
  userId: order.userId,
  couponId: order.couponId,
  recipientName: order.recipientName,
  phone: order.phone,
  fulfillmentType: order.fulfillmentType,
  deliveryAddress: order.deliveryAddress,
  deliveryDate: order.deliveryDate,
  deliveryTimeSlot: order.deliveryTimeSlot,
  subtotal: toMoney(order.subtotal),
  discountAmount: toMoney(order.discountAmount),
  shippingFee: toMoney(order.shippingFee),
  totalAmount: toMoney(order.totalAmount),
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  orderStatus: order.orderStatus,
  note: order.note,
  loyaltyPointsEarned: order.loyaltyPointsEarned,
  loyaltyPointsUsed: order.loyaltyPointsUsed,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

const formatOrderDetail = (order: Parameters<typeof formatOrderSummary>[0] & {
  items: Parameters<typeof formatOrderItem>[0][];
  user?: {
    userId: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  } | null;
  coupon?: {
    couponId: string;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: Prisma.Decimal;
  } | null;
}) => ({
  ...formatOrderSummary(order),
  user: order.user ?? undefined,
  coupon: order.coupon
    ? {
        ...order.coupon,
        discountValue: toMoney(order.coupon.discountValue)
      }
    : null,
  items: order.items.map(formatOrderItem)
});

const resolveCartIdentity = (identity: OrderIdentity): CartIdentity => {
  if (identity.userId) {
    return { type: "user", id: identity.userId };
  }

  if (identity.sessionId) {
    return { type: "session", id: identity.sessionId };
  }

  throw new AppError(400, "Cart is empty");
};

const findSingleUserByContact = async (
  tx: TransactionClient,
  input: Pick<OrderCreateInput, "email" | "phone">
) => {
  const filters = [
    input.email ? { email: input.email } : undefined,
    input.phone ? { phone: input.phone } : undefined
  ].filter(Boolean) as Array<{ email: string } | { phone: string }>;

  if (filters.length === 0) return null;

  const users = await tx.user.findMany({
    where: { OR: filters },
    take: 2
  });
  const uniqueUserIds = new Set(users.map((user) => user.userId));

  if (uniqueUserIds.size > 1) {
    throw new AppError(409, "Email and phone belong to different accounts");
  }

  return users[0] ?? null;
};

const resolveOrderUser = async (
  tx: TransactionClient,
  identity: OrderIdentity,
  input: OrderCreateInput
) => {
  if (identity.userId) {
    return {
      userId: identity.userId,
      activationUserId: undefined
    };
  }

  const existingUser = await findSingleUserByContact(tx, input);
  if (existingUser) {
    return {
      userId: existingUser.userId,
      activationUserId: existingUser.isActive ? undefined : existingUser.userId
    };
  }

  const user = await tx.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      fullName: input.recipientName,
      authProvider: "local",
      isActive: false
    }
  });

  return {
    userId: user.userId,
    activationUserId: user.userId
  };
};

const calculateCouponDiscount = (
  coupon: {
    discountType: "percent" | "fixed";
    discountValue: Prisma.Decimal;
    maxDiscountAmount: Prisma.Decimal | null;
  },
  orderValue: number
) => {
  const discountValue = toMoney(coupon.discountValue);
  const rawDiscount =
    coupon.discountType === "percent"
      ? orderValue * (discountValue / 100)
      : discountValue;
  const cappedDiscount =
    coupon.maxDiscountAmount === null
      ? rawDiscount
      : Math.min(rawDiscount, toMoney(coupon.maxDiscountAmount));

  return toMoney(Math.min(cappedDiscount, orderValue));
};

const resolveCoupon = async (
  tx: TransactionClient,
  couponCode: string | undefined,
  subtotal: number
) => {
  if (!couponCode) {
    return {
      couponId: null,
      discountAmount: 0
    };
  }

  const coupon = await tx.coupon.findUnique({
    where: { code: couponCode }
  });

  if (!coupon) {
    throw new AppError(400, "Coupon not found");
  }

  const now = new Date();

  if (!coupon.isActive) {
    throw new AppError(400, "Coupon is inactive");
  }

  if (coupon.startDate > now || coupon.endDate < now) {
    throw new AppError(400, "Coupon is not valid at this time");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(400, "Coupon usage limit reached");
  }

  if (subtotal < toMoney(coupon.minOrderValue)) {
    throw new AppError(400, "Order value does not meet coupon minimum");
  }

  await tx.coupon.update({
    where: { couponId: coupon.couponId },
    data: { usedCount: { increment: 1 } }
  });

  return {
    couponId: coupon.couponId,
    discountAmount: calculateCouponDiscount(coupon, subtotal)
  };
};

const buildOrderItems = (items: CartItemResponse[]) =>
  items.map((item) => ({
    productId: item.product.productId,
    productNameSnapshot: item.product.name,
    unitPriceSnapshot: item.unitPrice,
    quantity: item.quantity,
    itemTotal: item.itemTotal,
    options: {
      create: item.options.map((option) => ({
        itemId: option.itemId,
        optionNameSnapshot: option.name,
        optionPriceSnapshot: option.extraPrice
      }))
    }
  }));

const sendOrderNotification = async (data: {
  activationUserId?: string;
  email?: string;
  phone: string;
  recipientName: string;
  orderId: string;
  totalAmount: number;
  paymentQrUrl: string | null;
  transferContent: string | null;
}) => {
  const activationUrl = data.activationUserId
    ? getActivationUrl(data.activationUserId)
    : undefined;

  const isCash = !data.transferContent;
  const paymentInfo = isCash
    ? "Thanh toán khi nhận hàng (COD)"
    : `Transfer content: ${data.transferContent}. QR: ${data.paymentQrUrl}`;
  const message = `WeBee order ${data.orderId} total ${data.totalAmount}. ${paymentInfo}`;

  if (data.email) {
    await emailTransporter.sendMail({
      from: env.EMAIL_USER,
      to: data.email,
      subject: `WeBee order ${data.orderId}`,
      text: `${message}${activationUrl ? ` Activate account: ${activationUrl}` : ""}`,
      html: `
        <p>Hi ${data.recipientName},</p>
        <p>Your WeBee order has been created.</p>
        <p>Total: <strong>${data.totalAmount}</strong></p>
        ${isCash
          ? `<p>Phương thức thanh toán: <strong>Thanh toán khi nhận hàng (COD)</strong></p>`
          : `<p>Transfer content: <strong>${data.transferContent}</strong></p>
             <p><img src="${data.paymentQrUrl}" alt="Payment QR" /></p>`
        }
        ${activationUrl ? `<p>Activate your account: <a href="${activationUrl}">${activationUrl}</a></p>` : ""}
      `
    });
    return;
  }

  await sendSms(
    data.phone,
    `${message}${activationUrl ? ` Activate: ${activationUrl}` : ""}`
  );
};

const getOrderDetailById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { orderId },
    include: {
      user: {
        select: {
          userId: true,
          fullName: true,
          email: true,
          phone: true
        }
      },
      coupon: {
        select: {
          couponId: true,
          code: true,
          discountType: true,
          discountValue: true
        }
      },
      items: {
        include: { options: true },
        orderBy: { orderItemId: "asc" }
      }
    }
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return formatOrderDetail(order);
};

export const createOrder = async (
  identity: OrderIdentity,
  input: OrderCreateInput
) => {
  const cartIdentity = resolveCartIdentity(identity);
  const cart = await getCart(cartIdentity);

  if (cart.items.length === 0) {
    throw new AppError(400, "Cart is empty");
  }

  const shippingFee = getShippingFee(input);
  const createdOrder = await prisma.$transaction(async (tx) => {
    const { userId, activationUserId } = await resolveOrderUser(tx, identity, input);
    const { couponId, discountAmount } = await resolveCoupon(
      tx,
      input.couponCode,
      cart.subtotal
    );
    const totalAmount = toMoney(cart.subtotal - discountAmount + shippingFee);

    const order = await tx.order.create({
      data: {
        userId,
        couponId,
        recipientName: input.recipientName,
        phone: input.phone,
        fulfillmentType: input.fulfillmentType,
        deliveryAddress: input.deliveryAddress,
        deliveryDate: input.deliveryDate,
        deliveryTimeSlot: input.deliveryTimeSlot,
        subtotal: cart.subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        note: input.note,
        cardType: input.cardType,
        cardMessage: input.cardMessage,
        items: {
          create: buildOrderItems(cart.items)
        }
      }
    });

    return { order, activationUserId };
  });

  await clearCart(cartIdentity);

  const isTransfer = input.paymentMethod === "transfer";
  const paymentQrUrl = isTransfer ? getStaticQrUrl() : null;
  const transferContent = isTransfer
    ? getTransferContent(createdOrder.order.orderId)
    : null;

  try {
    await sendOrderNotification({
      activationUserId: createdOrder.activationUserId,
      email: input.email,
      phone: input.phone,
      recipientName: input.recipientName,
      orderId: createdOrder.order.orderId,
      totalAmount: toMoney(createdOrder.order.totalAmount),
      paymentQrUrl,
      transferContent
    });
  } catch (error) {
    console.warn("Order notification failed", error);
  }

  return {
    order_id: createdOrder.order.orderId,
    summary: formatOrderSummary(createdOrder.order),
    payment_qr_url: paymentQrUrl,
    transfer_content: transferContent
  };
};

export const getMyOrders = async (
  userId: string | undefined,
  query: Pick<OrderListQuery, "page" | "limit">
) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  const skip = (query.page - 1) * query.limit;
  const where: Prisma.OrderWhereInput = { userId };
  const [total, items] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit
    })
  ]);

  return {
    items: items.map(formatOrderSummary),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
};

export const getMyOrderDetail = async (
  userId: string | undefined,
  orderId: string
) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  const order = await prisma.order.findFirst({
    where: {
      orderId,
      userId
    },
    include: {
      items: {
        include: { options: true },
        orderBy: { orderItemId: "asc" }
      }
    }
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return {
    ...formatOrderSummary(order),
    payment_qr_url: getStaticQrUrl(),
    transfer_content: getTransferContent(order.orderId),
    items: order.items.map(formatOrderItem)
  };
};

export const cancelMyOrder = async (
  userId: string | undefined,
  orderId: string
) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  const order = await prisma.order.findFirst({
    where: {
      orderId,
      userId
    }
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.orderStatus !== "pending") {
    throw new AppError(400, "Only pending orders can be cancelled");
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    if (order.loyaltyPointsUsed > 0) {
      await tx.user.update({
        where: { userId },
        data: { loyaltyPoints: { increment: order.loyaltyPointsUsed } }
      });
      await tx.loyaltyLog.create({
        data: {
          userId,
          orderId,
          pointsDelta: order.loyaltyPointsUsed,
          reason: "Order cancelled points refund"
        }
      });
    }

    return tx.order.update({
      where: { orderId },
      data: { orderStatus: "cancelled" }
    });
  });

  return formatOrderSummary(updatedOrder);
};

export const confirmPaymentWebhook = async (input: PaymentWebhookInput) => {
  const order = await prisma.order.findUnique({
    where: { orderId: input.orderId }
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.paymentStatus !== "pending") {
    throw new AppError(409, "Order payment is not pending");
  }

  if (toMoney(order.totalAmount) !== toMoney(input.amount)) {
    throw new AppError(400, "Payment amount does not match order total");
  }

  const updatedOrder = await prisma.order.update({
    where: { orderId: input.orderId },
    data: {
      paymentStatus: "paid",
      orderStatus: "confirmed"
    }
  });

  return {
    message: "Payment confirmed",
    order: formatOrderSummary(updatedOrder)
  };
};

const buildAdminOrderWhere = (query: OrderListQuery): Prisma.OrderWhereInput => {
  const where: Prisma.OrderWhereInput = {};

  if (query.status) {
    where.orderStatus = query.status;
  }

  if (query.paymentStatus) {
    where.paymentStatus = query.paymentStatus;
  }

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {
      ...(query.dateFrom && { gte: query.dateFrom }),
      ...(query.dateTo && { lte: query.dateTo })
    };
  }

  if (query.search) {
    where.OR = [
      { recipientName: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search } },
      ...(uuidPattern.test(query.search)
        ? [{ orderId: query.search }]
        : [])
    ];
  }

  return where;
};

export const getAdminOrders = async (query: OrderListQuery) => {
  const skip = (query.page - 1) * query.limit;
  const where = buildAdminOrderWhere(query);
  const [total, items] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit
    })
  ]);

  return {
    items: items.map((order) => ({
      ...formatOrderSummary(order),
      user: order.user
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
};

export const getAdminOrderDetail = async (orderId: string) =>
  getOrderDetailById(orderId);

const assertValidStatusTransition = (
  current: OrderStatus,
  next: OrderStatus,
  paymentStatus: "pending" | "paid" | "failed"
) => {
  if (current === next) return;

  if (next === "cancelled") {
    return;
  }

  const orderFlow: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "ready",
    "delivered"
  ];
  const currentIndex = orderFlow.indexOf(current);
  const nextIndex = orderFlow.indexOf(next);

  if (current === "cancelled" || currentIndex === -1 || nextIndex !== currentIndex + 1) {
    throw new AppError(400, "Invalid order status transition");
  }

  if (next === "confirmed" && paymentStatus !== "paid") {
    throw new AppError(400, "Pending payments must be confirmed through webhook");
  }
};

export const updateAdminOrderStatus = async (
  orderId: string,
  input: UpdateOrderStatusInput
) => {
  const order = await prisma.order.findUnique({
    where: { orderId }
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  assertValidStatusTransition(
    order.orderStatus,
    input.status,
    order.paymentStatus
  );

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { orderId },
      data: { orderStatus: input.status }
    });

    if (input.status === "delivered") {
      await creditDeliveredOrderLoyaltyInTransaction(tx, updated.orderId);
    }

    if (input.status === "cancelled") {
      await revokeOrderLoyaltyInTransaction(tx, updated.orderId);
    }

    return tx.order.findUniqueOrThrow({
      where: { orderId }
    });
  });

  return formatOrderSummary(updatedOrder);
};
