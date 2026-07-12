import jwt from "jsonwebtoken";
import { Prisma, type OrderStatus } from "@prisma/client";
import type { SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/errorHandler";
import { clearCart, clearCartItems, getCart } from "../cart/cart.service";
import type { CartIdentity, CartItemResponse } from "../cart/cart.types";
import {
  creditDeliveredOrderLoyaltyInTransaction,
  revokeOrderLoyaltyInTransaction
} from "../loyalty/loyalty.service";
import { calculateCouponDiscount } from "../coupons/coupons.util";
import { renderOrderNotificationEmail, sendEmailAsync } from "../../utils/email";
import { toMoney } from "../../utils/money";
import { getStaticQrUrl } from "../../utils/payment";
import { sendSms } from "../../utils/sms";
import type {
  OrderCreateInput,
  OrderIdentity,
  OrderListQuery,
  OrderTrackingQuery,
  PaymentWebhookInput,
  UpdateOrderStatusInput
} from "./orders.types";

const DELIVERY_SHIPPING_FEE = 0;
const PICKUP_SHIPPING_FEE = 0;
const firstFrontendUrl = env.FRONTEND_URL.split(",")[0].trim();
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TransactionClient = Prisma.TransactionClient;

const getTransferContent = (orderId: string) => `DH${orderId}`;

const getTrackingToken = (orderId: string) =>
  jwt.sign(
    { orderId, purpose: "order_tracking" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "7d" as SignOptions["expiresIn"] }
  );

const verifyTrackingToken = (orderId: string, token: string) => {
  let payload: string | jwt.JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    throw new AppError(401, "Invalid or expired tracking token");
  }

  if (!payload || typeof payload !== "object") {
    throw new AppError(401, "Invalid or expired tracking token");
  }

  const candidate = payload as { orderId?: unknown; purpose?: unknown };
  if (candidate.purpose !== "order_tracking" || candidate.orderId !== orderId) {
    throw new AppError(401, "Invalid or expired tracking token");
  }
};

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
  // Present only on the detail query — lets the client know if this line was
  // already reviewed so it can show the rating instead of the review form.
  review?: { reviewId: string; rating: number; comment: string | null } | null;
}) => ({
  orderItemId: item.orderItemId,
  productId: item.productId,
  // Public DTO uses plain names; the *Snapshot suffix is a storage detail.
  productName: item.productNameSnapshot,
  unitPrice: toMoney(item.unitPriceSnapshot),
  quantity: item.quantity,
  isCustom: item.isCustom,
  customNote: item.customNote,
  itemTotal: toMoney(item.itemTotal),
  options: item.options.map((option) => ({
    id: option.id,
    itemId: option.itemId,
    name: option.optionNameSnapshot,
    extraPrice: toMoney(option.optionPriceSnapshot)
  })),
  review:
    item.review === undefined
      ? undefined
      : item.review
        ? {
            reviewId: item.review.reviewId,
            rating: item.review.rating,
            comment: item.review.comment
          }
        : null
});

const formatOrderSummary = (order: {
  orderId: string;
  userId: string | null;
  couponId: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
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
  cardType: string;
  cardMessage: string | null;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  orderId: order.orderId,
  userId: order.userId,
  couponId: order.couponId,
  buyerName: order.buyerName ?? null,
  buyerPhone: order.buyerPhone ?? null,
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
  cardType: order.cardType,
  cardMessage: order.cardMessage,
  loyaltyPointsEarned: order.loyaltyPointsEarned,
  loyaltyPointsUsed: order.loyaltyPointsUsed,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

const getPaymentFields = (order: { orderId: string; paymentMethod: "cash" | "transfer" | "card" }) => {
  const isTransfer = order.paymentMethod === "transfer";

  return {
    paymentQrUrl: isTransfer ? getStaticQrUrl() : null,
    transferContent: isTransfer ? getTransferContent(order.orderId) : null
  };
};

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
  ...getPaymentFields(order),
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
  input: Pick<OrderCreateInput, "email" | "buyerPhone">
) => {
  const filters = [
    input.email ? { email: input.email } : undefined,
    input.buyerPhone ? { phone: input.buyerPhone } : undefined
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
    // Không tự gắn đơn khách vãng lai vào một tài khoản ĐÃ kích hoạt (tài khoản
    // thật) chỉ vì trùng email/phone — khách chưa chứng minh sở hữu. Làm vậy sẽ
    // rò lịch sử đơn + điểm loyalty sang người lạ. Đơn giữ dạng guest-only.
    if (existingUser.isActive) {
      return {
        userId: undefined,
        activationUserId: undefined
      };
    }

    // Tài khoản shell chưa kích hoạt (do chính luồng guest tạo trước đó): tái sử
    // dụng và gửi lại link kích hoạt.
    return {
      userId: existingUser.userId,
      activationUserId: existingUser.userId
    };
  }

  const user = await tx.user.create({
    data: {
      email: input.email,
      phone: input.buyerPhone,
      fullName: input.buyerName,
      authProvider: "local",
      isActive: false
    }
  });

  return {
    userId: user.userId,
    activationUserId: user.userId
  };
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

  const claimedCoupon = await tx.coupon.updateMany({
    where: {
      couponId: coupon.couponId,
      OR: [
        { usageLimit: null },
        { usedCount: { lt: coupon.usageLimit ?? 0 } }
      ]
    },
    data: { usedCount: { increment: 1 } }
  });

  if (claimedCoupon.count !== 1) {
    throw new AppError(400, "Coupon usage limit reached");
  }

  return {
    couponId: coupon.couponId,
    discountAmount: calculateCouponDiscount(coupon, subtotal)
  };
};

/**
 * Hoàn 1 lượt sử dụng coupon khi đơn bị hủy. Guard `usedCount > 0` để không
 * bao giờ giảm xuống âm (idempotent nếu chẳng may gọi trùng).
 */
const releaseCouponUsage = async (
  tx: TransactionClient,
  couponId: string | null
) => {
  if (!couponId) {
    return;
  }

  await tx.coupon.updateMany({
    where: { couponId, usedCount: { gt: 0 } },
    data: { usedCount: { decrement: 1 } }
  });
};

/**
 * Hoàn điểm loyalty ĐÃ TIÊU khi đơn bị hủy. Idempotent: chỉ hoàn khi
 * `loyaltyPointsUsed > 0`, rồi reset field về 0 trong cùng điều kiện (updateMany
 * atomic) để gọi trùng không hoàn hai lần (xem business-problem.md B-1).
 */
const refundUsedLoyaltyPoints = async (
  tx: TransactionClient,
  order: { orderId: string; userId: string | null; loyaltyPointsUsed: number }
) => {
  if (!order.userId || order.loyaltyPointsUsed <= 0) {
    return;
  }

  // Guard chống hoàn trùng: chỉ thành công 1 lần nhờ điều kiện loyaltyPointsUsed > 0.
  const reset = await tx.order.updateMany({
    where: { orderId: order.orderId, loyaltyPointsUsed: { gt: 0 } },
    data: { loyaltyPointsUsed: 0 }
  });

  if (reset.count === 0) {
    return;
  }

  await tx.user.update({
    where: { userId: order.userId },
    data: { loyaltyPoints: { increment: order.loyaltyPointsUsed } }
  });

  await tx.loyaltyLog.create({
    data: {
      userId: order.userId,
      orderId: order.orderId,
      pointsDelta: order.loyaltyPointsUsed,
      reason: "Order cancelled points refund"
    }
  });
};

/**
 * Giảm lại `soldCount` khi hủy một đơn ĐÃ delivered (lúc delivered đã tăng).
 * Không cho soldCount xuống âm (xem business-problem.md B-4).
 */
const revertSoldCountForOrder = async (
  tx: TransactionClient,
  orderId: string
) => {
  const items = await tx.orderItem.groupBy({
    by: ["productId"],
    where: { orderId },
    _sum: { quantity: true }
  });

  await Promise.all(
    items.map((item) => {
      const qty = item._sum.quantity ?? 0;
      if (qty <= 0) return Promise.resolve();
      return tx.product.updateMany({
        where: { productId: item.productId, soldCount: { gte: qty } },
        data: { soldCount: { decrement: qty } }
      });
    })
  );
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
  buyerName: string;
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
    await sendEmailAsync({
      from: env.EMAIL_USER,
      to: data.email,
      subject: `WeBee order ${data.orderId}`,
      text: `${message}${activationUrl ? ` Activate account: ${activationUrl}` : ""}`,
      html: renderOrderNotificationEmail({
        buyerName: data.buyerName,
        orderId: data.orderId,
        totalAmount: data.totalAmount,
        isCash,
        transferContent: data.transferContent,
        paymentQrUrl: data.paymentQrUrl,
        activationUrl
      })
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

  const scopedCartItemIds = input.cartItemIds;
  const orderItems = scopedCartItemIds?.length
    ? cart.items.filter((item) => scopedCartItemIds.includes(item.cartItemId))
    : cart.items;

  if (orderItems.length === 0) {
    throw new AppError(400, "Selected cart items are not available");
  }

  if (scopedCartItemIds?.length && orderItems.length !== new Set(scopedCartItemIds).size) {
    throw new AppError(400, "Selected cart items are not available");
  }

  const subtotal = toMoney(orderItems.reduce((sum, item) => sum + item.itemTotal, 0));

  const shippingFee = getShippingFee(input);
  const createdOrder = await prisma.$transaction(async (tx) => {
    const { userId, activationUserId } = await resolveOrderUser(tx, identity, input);
    const { couponId, discountAmount } = await resolveCoupon(
      tx,
      input.couponCode,
      subtotal
    );
    const totalAmount = toMoney(subtotal - discountAmount + shippingFee);

    const order = await tx.order.create({
      data: {
        userId,
        couponId,
        buyerName: input.buyerName,
        buyerPhone: input.buyerPhone,
        recipientName: input.recipientName,
        phone: input.phone,
        fulfillmentType: input.fulfillmentType,
        deliveryAddress: input.deliveryAddress,
        deliveryDate: input.deliveryDate,
        deliveryTimeSlot: input.deliveryTimeSlot,
        subtotal,
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
          create: buildOrderItems(orderItems)
        }
      }
    });

    return { order, activationUserId };
  });

  if (scopedCartItemIds?.length) {
    await clearCartItems(cartIdentity, scopedCartItemIds);
  } else {
    await clearCart(cartIdentity);
  }

  const isTransfer = input.paymentMethod === "transfer";
  const paymentQrUrl = isTransfer ? getStaticQrUrl() : null;
  const transferContent = isTransfer
    ? getTransferContent(createdOrder.order.orderId)
    : null;

  try {
    await sendOrderNotification({
      activationUserId: createdOrder.activationUserId,
      email: input.email,
      phone: input.buyerPhone,
      buyerName: input.buyerName,
      orderId: createdOrder.order.orderId,
      totalAmount: toMoney(createdOrder.order.totalAmount),
      paymentQrUrl,
      transferContent
    });
  } catch (error) {
    console.warn("Order notification failed", error);
  }

  const trackingToken = getTrackingToken(createdOrder.order.orderId);

  return {
    orderId: createdOrder.order.orderId,
    order_id: createdOrder.order.orderId,
    summary: formatOrderSummary(createdOrder.order),
    paymentQrUrl,
    payment_qr_url: paymentQrUrl,
    transferContent,
    transfer_content: transferContent,
    trackingToken,
    tracking_token: trackingToken
  };
};

export const getMyOrders = async (
  userId: string | undefined,
  query: Pick<OrderListQuery, "page" | "limit" | "status">
) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  const skip = (query.page - 1) * query.limit;
  const where: Prisma.OrderWhereInput = {
    userId,
    ...(query.status && { orderStatus: query.status })
  };
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
        include: {
          options: true,
          review: { select: { reviewId: true, rating: true, comment: true } }
        },
        orderBy: { orderItemId: "asc" }
      }
    }
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return {
    ...formatOrderSummary(order),
    ...getPaymentFields(order),
    items: order.items.map(formatOrderItem)
  };
};

export const getTrackedOrderDetail = async (
  orderId: string,
  query: OrderTrackingQuery
) => {
  verifyTrackingToken(orderId, query.token);

  const order = await prisma.order.findUnique({
    where: { orderId },
    include: {
      items: {
        include: {
          options: true,
          review: { select: { reviewId: true, rating: true, comment: true } }
        },
        orderBy: { orderItemId: "asc" }
      }
    }
  });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  return {
    ...formatOrderSummary(order),
    ...getPaymentFields(order),
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
    await refundUsedLoyaltyPoints(tx, order);
    await releaseCouponUsage(tx, order.couponId);

    return tx.order.update({
      where: { orderId },
      data: { orderStatus: "cancelled" }
    });
  });

  return formatOrderSummary(updatedOrder);
};

/**
 * Cho phép khách ĐÃ ĐĂNG NHẬP "nhận" một đơn guest (userId=null) về tài khoản
 * mình, chứng minh sở hữu bằng tracking token của đơn. Nếu đơn đã delivered thì
 * cộng điểm loyalty ngay (trước đây đơn guest không bao giờ được cộng điểm — xem
 * business-problem.md D-5).
 */
export const claimGuestOrder = async (
  userId: string | undefined,
  orderId: string,
  token: string
) => {
  if (!userId) {
    throw new AppError(401, "Authentication is required");
  }

  // Chứng minh người claim thực sự nắm link theo dõi của đơn.
  verifyTrackingToken(orderId, token);

  const order = await prisma.order.findUnique({ where: { orderId } });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.userId === userId) {
    // Đã thuộc về mình rồi → không cần làm gì (idempotent).
    return formatOrderSummary(order);
  }

  // Chỉ nhận được đơn CHƯA gắn với tài khoản nào; không cướp đơn của người khác.
  if (order.userId !== null) {
    throw new AppError(409, "Order already belongs to another account");
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const linked = await tx.order.update({
      where: { orderId },
      data: { userId }
    });

    // Đơn đã giao trước khi được nhận → cộng điểm cho chủ mới.
    if (linked.orderStatus === "delivered") {
      await creditDeliveredOrderLoyaltyInTransaction(tx, orderId);
    }

    return tx.order.findUniqueOrThrow({ where: { orderId } });
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

  // Chỉ đơn chuyển khoản mới được xác nhận qua webhook. Đơn COD (cash)/thẻ
  // không đi qua cổng chuyển khoản nên không được phép flip sang "paid" ở đây.
  if (order.paymentMethod !== "transfer") {
    throw new AppError(400, "Only bank-transfer orders can be confirmed via webhook");
  }

  // Idempotency: đơn đã rời trạng thái pending (đã paid/failed) thì không xử lý lại.
  if (order.paymentStatus !== "pending") {
    throw new AppError(409, "Order payment is not pending");
  }

  // Yêu cầu nội dung chuyển khoản khớp mã đơn để chống nhầm/giả mạo bằng số tiền.
  const expectedTransferContent = getTransferContent(order.orderId);
  if (
    input.transferContent !== undefined &&
    input.transferContent.replace(/\s+/g, "").toUpperCase() !==
      expectedTransferContent.toUpperCase()
  ) {
    throw new AppError(400, "Transfer content does not match order reference");
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

/**
 * Admin xác nhận đã thu tiền THỦ CÔNG (dùng cho đơn COD/tiền mặt, hoặc đối soát
 * chuyển khoản bằng tay). Khác webhook: hoạt động cho MỌI phương thức, KHÔNG ép
 * orderStatus (giữ máy trạng thái độc lập), và xác thực qua role admin thay vì
 * secret webhook (xem business-problem.md B-2, B-3).
 */
export const markOrderPaidByAdmin = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { orderId } });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  if (order.orderStatus === "cancelled") {
    throw new AppError(400, "Cannot mark a cancelled order as paid");
  }

  // Idempotent: đã paid thì trả về nguyên trạng, không lỗi.
  if (order.paymentStatus === "paid") {
    return {
      message: "Order already marked as paid",
      order: formatOrderSummary(order)
    };
  }

  const updatedOrder = await prisma.order.update({
    where: { orderId },
    data: { paymentStatus: "paid" }
  });

  return {
    message: "Payment marked as paid",
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
        },
        items: true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit
    })
  ]);

  return {
    items: items.map((order) => ({
      ...formatOrderSummary(order),
      user: order.user,
      items: order.items.map((item) => ({
        orderItemId: item.orderItemId,
        productId: item.productId,
        productName: item.productNameSnapshot,
        quantity: item.quantity,
        unitPrice: toMoney(item.unitPriceSnapshot),
        itemTotal: toMoney(item.itemTotal),
        options: []
      }))
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
  paymentStatus: "pending" | "paid" | "failed",
  paymentMethod: string
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

  if (paymentMethod === "cash") {
    return;
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
    order.paymentStatus,
    order.paymentMethod
  );

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { orderId },
      data: {
        orderStatus: input.status,
        ...(input.cancelReason && {
          note: order.note
            ? `${order.note} | Lý do hủy: ${input.cancelReason}`
            : `Lý do hủy: ${input.cancelReason}`
        })
      }
    });

    if (input.status === "delivered") {
      await creditDeliveredOrderLoyaltyInTransaction(tx, updated.orderId);

      const deliveredItems = await tx.orderItem.groupBy({
        by: ["productId"],
        where: { orderId: updated.orderId },
        _sum: { quantity: true }
      });

      await Promise.all(
        deliveredItems.map((item) =>
          tx.product.update({
            where: { productId: item.productId },
            data: { soldCount: { increment: item._sum.quantity ?? 0 } }
          })
        )
      );
    }

    if (input.status === "cancelled") {
      // Hoàn điểm ĐÃ KIẾM (nếu đơn từng delivered) + hoàn điểm ĐÃ TIÊU + hoàn coupon.
      await revokeOrderLoyaltyInTransaction(tx, updated.orderId);
      await refundUsedLoyaltyPoints(tx, order);
      await releaseCouponUsage(tx, order.couponId);

      // Nếu hủy một đơn ĐÃ delivered thì trả lại soldCount đã cộng lúc giao.
      if (order.orderStatus === "delivered") {
        await revertSoldCountForOrder(tx, updated.orderId);
      }
    }

    return tx.order.findUniqueOrThrow({
      where: { orderId }
    });
  });

  return formatOrderSummary(updatedOrder);
};
