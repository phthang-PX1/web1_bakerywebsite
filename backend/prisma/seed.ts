import bcrypt from "bcrypt";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import {
  type AnalyticsEventType,
  type FulfillmentType,
  type MembershipTier,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();
const documentDir = path.resolve(__dirname, "../../document/backend");
const operationalNow = new Date("2026-06-27T10:00:00.000+07:00");

type CsvRow = Record<string, string>;

type CouponSeed = {
  couponId: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  minOrderValue: string;
  maxDiscountAmount?: string | null;
  usageLimit?: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

type SeedOrder = {
  orderId: string;
  userId: string;
  couponId: string | null;
  recipientName: string;
  phone: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress: string | null;
  deliveryDate: Date;
  deliveryTimeSlot: string;
  subtotal: string;
  discountAmount: string;
  shippingFee: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  note: string | null;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  createdAt: Date;
  updatedAt: Date;
};

type SeedOrderItem = {
  orderItemId: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  isCustom: boolean;
  customNote: string | null;
  itemTotal: string;
};

type SeedOrderItemOption = {
  id: string;
  orderItemId: string;
  itemId: string;
  optionNameSnapshot: string;
  optionPriceSnapshot: string;
};

type OrderBuildResult = {
  orders: SeedOrder[];
  orderItems: SeedOrderItem[];
  orderItemOptions: SeedOrderItemOption[];
  loyaltyLogs: {
    logId: string;
    userId: string;
    orderId: string;
    pointsDelta: number;
    reason: string;
    createdAt: Date;
  }[];
  membershipCycles: {
    cycleId: string;
    userId: string;
    cycleStart: Date;
    cycleEnd: Date;
    totalOrders: number;
    totalRevenue: string;
    tierResult: MembershipTier;
    createdAt: Date;
  }[];
  userSummaries: Map<string, { loyaltyPoints: number; tier: MembershipTier }>;
  couponUsage: Map<string, number>;
};

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toBoolean = (value: string) => value.trim().toLowerCase() === "true";
const toDate = (value: string) => new Date(value);
const money = (value: number) => Math.round(value).toString();

const seededUuid = (input: string) => {
  const hash = createHash("sha1").update(input).digest("hex");
  const variant = ["8", "9", "a", "b"][parseInt(hash[16], 16) % 4];
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`,
    `${variant}${hash.slice(17, 20)}`,
    hash.slice(20, 32)
  ].join("-");
};

const daysAgo = (days: number, hour = 10, minute = 0) => {
  const date = new Date(operationalNow);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const addDays = (date: Date, days: number, hour = date.getHours(), minute = date.getMinutes()) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(hour, minute, 0, 0);
  return next;
};

const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000);

function parseCsv(content: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function readCsv(fileName: string): CsvRow[] {
  const raw = fs.readFileSync(path.join(documentDir, fileName), "utf8").replace(/^\uFEFF/, "");
  const [headers, ...records] = parseCsv(raw);

  return records.map((record) =>
    headers.reduce<CsvRow>((row, header, index) => {
      row[header] = record[index] ?? "";
      return row;
    }, {})
  );
}

async function clearDatabase() {
  await prisma.analyticsEvent.deleteMany();
  await prisma.voucherInventory.deleteMany();
  await prisma.membershipCycle.deleteMany();
  await prisma.loyaltyLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.optionItem.deleteMany();
  await prisma.optionGroup.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
}

async function seedCatalog() {
  const categories = readCsv("categories.csv").map((row) => ({
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: toNullable(row.description),
    imageUrl: toNullable(row.image_url),
    isActive: toBoolean(row.is_active),
    createdAt: toDate(row.created_at)
  }));

  const products = readCsv("products.csv").map((row) => ({
    productId: row.product_id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: toNullable(row.description),
    basePrice: row.base_price,
    thumbnailUrl: toNullable(row.thumbnail_url),
    isCustomizable: toBoolean(row.is_customizable),
    avgRating: row.avg_rating,
    isActive: toBoolean(row.is_active),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at)
  }));

  const productImages = readCsv("product_images.csv").map((row) => ({
    imageId: row.image_id,
    productId: row.product_id,
    imageUrl: row.image_url,
    sortOrder: Number(row.sort_order)
  }));

  const optionGroups = readCsv("option_groups.csv").map((row) => ({
    groupId: row.group_id,
    productId: row.product_id,
    name: row.name,
    isRequired: toBoolean(row.is_required),
    isMultiple: toBoolean(row.is_multiple),
    sortOrder: Number(row.sort_order)
  }));

  const optionItems = readCsv("option_items.csv").map((row) => ({
    itemId: row.item_id,
    groupId: row.group_id,
    name: row.name,
    extraPrice: row.extra_price,
    imageUrl: toNullable(row.image_url),
    isActive: toBoolean(row.is_active),
    sortOrder: Number(row.sort_order)
  }));

  await prisma.category.createMany({ data: categories });
  await prisma.product.createMany({ data: products });
  await prisma.productImage.createMany({ data: productImages });
  await prisma.optionGroup.createMany({ data: optionGroups });
  await prisma.optionItem.createMany({ data: optionItems });
}

const customerNames = [
  "Nguyễn Minh Anh",
  "Trần Gia Bảo",
  "Lê Hoàng Yến",
  "Phạm Quốc Huy",
  "Đặng Thu Hà",
  "Võ Ngọc Linh",
  "Bùi Khánh Vy",
  "Hoàng Đức Nam",
  "Ngô Thanh Tâm",
  "Đỗ Hải Đăng",
  "Phan Như Quỳnh",
  "Mai Gia Hân",
  "Trương Nhật Minh",
  "Huỳnh Bảo Ngọc",
  "Lý Tuấn Kiệt",
  "Tạ Phương Thảo",
  "Cao Minh Khang",
  "Dương Mỹ Duyên",
  "Hồ Gia Phúc",
  "Vũ Hà My",
  "Nguyễn Hải Yến",
  "Trần Minh Quân",
  "Lê Bảo Trâm",
  "Phạm Anh Khoa",
  "Đặng Nhật Linh",
  "Võ Thiên Ân",
  "Bùi Kim Chi",
  "Hoàng Tuấn Anh",
  "Ngô Bảo Châu",
  "Đỗ Mai Phương",
  "Phan Hoàng Long",
  "Mai Thanh Bình",
  "Trương Khánh Ngân",
  "Huỳnh Nhật Hạ",
  "Lý Gia Bảo",
  "Tạ Minh Châu",
  "Cao Hữu Phước",
  "Dương Ngọc Mai",
  "Hồ Thiện Nhân",
  "Vũ Thanh Hương",
  "Nguyễn Phúc Lâm",
  "Trần An Nhiên"
];

const districts = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 7",
  "Quận 10",
  "Quận Bình Thạnh",
  "TP. Thủ Đức",
  "Quận Tân Bình"
];

async function seedUsersAndAddresses() {
  const adminPasswordHash = await bcrypt.hash("Admin@123", 12);
  const memberPasswordHash = await bcrypt.hash("Member@123", 12);

  await prisma.user.create({
    data: {
      userId: seededUuid("user:admin"),
      email: "admin@webee.vn",
      phone: "0900000001",
      passwordHash: adminPasswordHash,
      fullName: "WeBee Admin",
      authProvider: "local",
      role: "admin",
      isActive: true,
      createdAt: daysAgo(20, 8),
      updatedAt: daysAgo(0, 8)
    }
  });

  const members = customerNames.map((fullName, index) => ({
    userId: seededUuid(`user:member:${index + 1}`),
    email: `khach${String(index + 1).padStart(2, "0")}@webee.vn`,
    phone: `0901${String(index + 1).padStart(6, "0")}`,
    passwordHash: memberPasswordHash,
    fullName,
    authProvider: "local" as const,
    role: "member" as const,
    isActive: index < 36,
    createdAt: daysAgo(13 - (index % 14), 8 + (index % 9), (index * 7) % 60),
    updatedAt: daysAgo(Math.max(0, 10 - (index % 11)), 9 + (index % 8), (index * 11) % 60)
  }));

  await prisma.user.createMany({ data: members });

  const addresses = members.slice(0, 34).flatMap((member, index) => {
    const primary = {
      addressId: seededUuid(`address:${member.userId}:default`),
      userId: member.userId,
      recipientName: member.fullName,
      phone: member.phone,
      street: `${24 + index} Đường Hoa Sữa`,
      district: districts[index % districts.length],
      city: "TP. Hồ Chí Minh",
      isDefault: true,
      createdAt: addHours(member.createdAt, 2)
    };

    if (index % 9 !== 0) return [primary];

    return [
      primary,
      {
        addressId: seededUuid(`address:${member.userId}:office`),
        userId: member.userId,
        recipientName: member.fullName,
        phone: member.phone,
        street: `${10 + index} Đường Pasteur`,
        district: districts[(index + 3) % districts.length],
        city: "TP. Hồ Chí Minh",
        isDefault: false,
        createdAt: addHours(member.createdAt, 4)
      }
    ];
  });

  await prisma.address.createMany({ data: addresses });

  return members;
}

function buildCoupons(): CouponSeed[] {
  return [
    {
      couponId: seededUuid("coupon:WELCOME10"),
      code: "WELCOME10",
      discountType: "percent",
      discountValue: "10",
      minOrderValue: "0",
      maxDiscountAmount: "100000",
      usageLimit: 500,
      startDate: daysAgo(14),
      endDate: addDays(operationalNow, 45),
      isActive: true
    },
    {
      couponId: seededUuid("coupon:SAVE50K"),
      code: "SAVE50K",
      discountType: "fixed",
      discountValue: "50000",
      minOrderValue: "250000",
      usageLimit: 300,
      startDate: daysAgo(14),
      endDate: addDays(operationalNow, 45),
      isActive: true
    },
    {
      couponId: seededUuid("coupon:MEMBER15"),
      code: "MEMBER15",
      discountType: "percent",
      discountValue: "15",
      minOrderValue: "300000",
      maxDiscountAmount: "150000",
      usageLimit: 150,
      startDate: daysAgo(10),
      endDate: addDays(operationalNow, 30),
      isActive: true
    },
    {
      couponId: seededUuid("coupon:BIRTHDAY30"),
      code: "BIRTHDAY30",
      discountType: "fixed",
      discountValue: "30000",
      minOrderValue: "120000",
      usageLimit: 200,
      startDate: daysAgo(14),
      endDate: addDays(operationalNow, 60),
      isActive: true
    },
    {
      couponId: seededUuid("coupon:VIP20"),
      code: "VIP20",
      discountType: "percent",
      discountValue: "20",
      minOrderValue: "500000",
      maxDiscountAmount: "200000",
      usageLimit: 80,
      startDate: daysAgo(14),
      endDate: addDays(operationalNow, 90),
      isActive: true
    }
  ];
}

async function seedCoupons() {
  const coupons = buildCoupons();
  await prisma.coupon.createMany({
    data: coupons.map((coupon) => ({
      ...coupon,
      usedCount: 0
    }))
  });
  return coupons;
}

const orderStatuses: OrderStatus[] = [
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "ready",
  "ready",
  "ready",
  "ready",
  "processing",
  "processing",
  "processing",
  "processing",
  "confirmed",
  "confirmed",
  "confirmed",
  "pending",
  "pending",
  "pending",
  "cancelled",
  "cancelled"
];

const orderNotes = [
  "Ghi chữ Chúc mừng sinh nhật trên mặt bánh.",
  "Ít ngọt, giao sau 18h.",
  "Tặng kèm nến sinh nhật giúp mình.",
  "Không lấy dao nhựa.",
  "Trang trí tone pastel.",
  null,
  "Gọi trước khi giao 15 phút.",
  null
];

const reviewComments = [
  "Bánh mềm, kem nhẹ và không bị ngọt gắt. Giao đúng giờ.",
  "Hình bánh giống ảnh, cả nhà đều thích.",
  "Đóng gói chắc chắn, bánh còn mát khi nhận.",
  "Tư vấn nhanh, phần topping tươi.",
  "Mùi vị ổn, lần sau sẽ thử size lớn hơn.",
  "Bánh đẹp hơn mong đợi, hợp tiệc sinh nhật nhỏ.",
  "Kem phủ mịn, cốt bánh không bị khô.",
  "Nhận tại cửa hàng nhanh, nhân viên hỗ trợ tốt."
];

function calculateDiscount(coupon: CouponSeed | undefined, subtotal: number) {
  if (!coupon || subtotal < Number(coupon.minOrderValue)) return 0;

  if (coupon.discountType === "fixed") {
    return Math.min(Number(coupon.discountValue), subtotal);
  }

  const rawDiscount = subtotal * (Number(coupon.discountValue) / 100);
  return Math.min(rawDiscount, Number(coupon.maxDiscountAmount ?? rawDiscount));
}

async function buildOrders(
  members: Awaited<ReturnType<typeof seedUsersAndAddresses>>,
  coupons: CouponSeed[]
): Promise<OrderBuildResult> {
  const products = await prisma.product.findMany({
    include: {
      optionGroups: {
        include: {
          items: {
            orderBy: { sortOrder: "asc" }
          }
        },
        orderBy: { sortOrder: "asc" }
      }
    },
    orderBy: { name: "asc" }
  });
  const couponByCode = new Map(coupons.map((coupon) => [coupon.code, coupon]));
  const orderCustomers = [...members.slice(0, 24), ...members.slice(0, 10)];
  const orders: SeedOrder[] = [];
  const orderItems: SeedOrderItem[] = [];
  const orderItemOptions: SeedOrderItemOption[] = [];
  const loyaltyLogs: OrderBuildResult["loyaltyLogs"] = [];
  const couponUsage = new Map<string, number>();
  const deliveredRevenueByUser = new Map<string, { totalOrders: number; totalRevenue: number; points: number }>();

  orderStatuses.forEach((orderStatus, index) => {
    const member = orderCustomers[index];
    const createdAt = daysAgo(13 - Math.floor((index / orderStatuses.length) * 14), 9 + (index % 10), (index * 13) % 60);
    const deliveryDate = addDays(createdAt, 1 + (index % 4), 9 + (index % 10), index % 2 === 0 ? 0 : 30);
    const fulfillmentType: FulfillmentType = index % 3 === 0 ? "delivery" : "pickup";
    const paymentMethod: PaymentMethod = index % 5 === 0 ? "cash" : "transfer";
    const paymentStatus: PaymentStatus =
      orderStatus === "pending" ? "pending" : orderStatus === "cancelled" && index % 2 === 0 ? "failed" : "paid";
    const couponCode = index % 13 === 0 ? "MEMBER15" : index % 9 === 0 ? "SAVE50K" : index % 6 === 0 ? "WELCOME10" : null;
    const coupon = couponCode ? couponByCode.get(couponCode) : undefined;
    const orderId = seededUuid(`order:${index + 1}`);
    const itemCount = 1 + (index % 3 === 0 ? 1 : 0) + (index % 11 === 0 ? 1 : 0);
    let subtotal = 0;

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
      const product = products[(index * 7 + itemIndex * 11) % products.length];
      const selectedOptions = product.isCustomizable
        ? product.optionGroups.flatMap((group, groupIndex) => {
            const activeItems = group.items.filter((item) => item.isActive);
            if (activeItems.length === 0) return [];

            const first = activeItems[(index + itemIndex + groupIndex) % activeItems.length];
            const second =
              group.isMultiple && group.name === "Topping" && activeItems.length > 1 && (index + itemIndex) % 4 === 0
                ? activeItems[(index + itemIndex + groupIndex + 1) % activeItems.length]
                : undefined;

            return second && second.itemId !== first.itemId ? [first, second] : [first];
          })
        : [];
      const optionTotal = selectedOptions.reduce((sum, option) => sum + Number(option.extraPrice), 0);
      const unitPrice = Number(product.basePrice) + optionTotal;
      const quantity = (index + itemIndex) % 5 === 0 ? 2 : 1;
      const itemTotal = unitPrice * quantity;
      const orderItemId = seededUuid(`order-item:${orderId}:${itemIndex + 1}`);

      subtotal += itemTotal;
      orderItems.push({
        orderItemId,
        orderId,
        productId: product.productId,
        productNameSnapshot: product.name,
        unitPriceSnapshot: money(unitPrice),
        quantity,
        isCustom: selectedOptions.length > 0,
        customNote: selectedOptions.length > 0 && (index + itemIndex) % 6 === 0 ? "Trang trí nhẹ, ít kem." : null,
        itemTotal: money(itemTotal)
      });

      selectedOptions.forEach((option) => {
        orderItemOptions.push({
          id: seededUuid(`order-item-option:${orderItemId}:${option.itemId}`),
          orderItemId,
          itemId: option.itemId,
          optionNameSnapshot: option.name,
          optionPriceSnapshot: money(Number(option.extraPrice))
        });
      });
    }

    const shippingFee = fulfillmentType === "delivery" ? 15000 : 0;
    const discountAmount = calculateDiscount(coupon, subtotal);
    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
    const loyaltyPointsEarned = orderStatus === "delivered" ? Math.floor(totalAmount / 10000) : 0;

    if (coupon) {
      couponUsage.set(coupon.couponId, (couponUsage.get(coupon.couponId) ?? 0) + 1);
    }

    if (orderStatus === "delivered") {
      const current = deliveredRevenueByUser.get(member.userId) ?? { totalOrders: 0, totalRevenue: 0, points: 0 };
      current.totalOrders += 1;
      current.totalRevenue += totalAmount;
      current.points += loyaltyPointsEarned;
      deliveredRevenueByUser.set(member.userId, current);
      loyaltyLogs.push({
        logId: seededUuid(`loyalty-log:${orderId}:earned`),
        userId: member.userId,
        orderId,
        pointsDelta: loyaltyPointsEarned,
        reason: `Cộng điểm từ đơn hàng DH${orderId}`,
        createdAt: addHours(deliveryDate, 3)
      });
    }

    orders.push({
      orderId,
      userId: member.userId,
      couponId: coupon?.couponId ?? null,
      recipientName: member.fullName,
      phone: member.phone,
      fulfillmentType,
      deliveryAddress:
        fulfillmentType === "delivery"
          ? `${24 + index} Đường Hoa Sữa, ${districts[index % districts.length]}, TP. Hồ Chí Minh`
          : null,
      deliveryDate,
      deliveryTimeSlot: `${8 + (index % 8)}:00 - ${10 + (index % 8)}:00`,
      subtotal: money(subtotal),
      discountAmount: money(discountAmount),
      shippingFee: money(shippingFee),
      totalAmount: money(totalAmount),
      paymentMethod,
      paymentStatus,
      orderStatus,
      note: orderNotes[index % orderNotes.length],
      loyaltyPointsEarned,
      loyaltyPointsUsed: 0,
      createdAt,
      updatedAt:
        orderStatus === "delivered"
          ? addHours(deliveryDate, 4)
          : orderStatus === "pending"
            ? addHours(createdAt, 1)
            : addHours(createdAt, 18 + (index % 18))
    });
  });

  const userSummaries = new Map<string, { loyaltyPoints: number; tier: MembershipTier }>();
  const membershipCycles = members.slice(0, 30).map((member) => {
    const summary = deliveredRevenueByUser.get(member.userId) ?? { totalOrders: 0, totalRevenue: 0, points: 0 };
    const tier: MembershipTier =
      summary.totalRevenue >= 1500000 || summary.totalOrders >= 5
        ? "gold"
        : summary.totalRevenue >= 900000 || summary.totalOrders >= 3
          ? "silver"
          : summary.totalOrders >= 1
            ? "bronze"
            : "member";

    userSummaries.set(member.userId, {
      loyaltyPoints: summary.points,
      tier
    });

    return {
      cycleId: seededUuid(`membership-cycle:${member.userId}:current`),
      userId: member.userId,
      cycleStart: daysAgo(14),
      cycleEnd: operationalNow,
      totalOrders: summary.totalOrders,
      totalRevenue: money(summary.totalRevenue),
      tierResult: tier,
      createdAt: operationalNow
    };
  });

  return {
    orders,
    orderItems,
    orderItemOptions,
    loyaltyLogs,
    membershipCycles,
    userSummaries,
    couponUsage
  };
}

async function seedOrdersAndRelatedData(members: Awaited<ReturnType<typeof seedUsersAndAddresses>>, coupons: CouponSeed[]) {
  const build = await buildOrders(members, coupons);

  await prisma.order.createMany({ data: build.orders });
  await prisma.orderItem.createMany({ data: build.orderItems });
  await prisma.orderItemOption.createMany({ data: build.orderItemOptions });
  await prisma.loyaltyLog.createMany({ data: build.loyaltyLogs });
  await prisma.membershipCycle.createMany({ data: build.membershipCycles });

  for (const [userId, summary] of build.userSummaries.entries()) {
    await prisma.user.update({
      where: { userId },
      data: {
        loyaltyPoints: summary.loyaltyPoints,
        membershipTier: summary.tier
      }
    });
  }

  for (const [couponId, usedCount] of build.couponUsage.entries()) {
    await prisma.coupon.update({
      where: { couponId },
      data: { usedCount }
    });
  }

  return build;
}

async function seedReviews(orderBuild: OrderBuildResult) {
  const deliveredOrderIds = new Set(
    orderBuild.orders.filter((order) => order.orderStatus === "delivered").map((order) => order.orderId)
  );
  const orderUserById = new Map(orderBuild.orders.map((order) => [order.orderId, order.userId]));
  const reviewableItems = orderBuild.orderItems.filter((item) => deliveredOrderIds.has(item.orderId)).slice(0, 24);

  const reviews = reviewableItems.map((item, index) => ({
    reviewId: seededUuid(`review:${item.orderItemId}`),
    orderItemId: item.orderItemId,
    userId: orderUserById.get(item.orderId) as string,
    rating: index % 9 === 0 ? 4 : 5,
    comment: reviewComments[index % reviewComments.length],
    imageUrl: index % 4 === 0 ? `https://picsum.photos/seed/webee-review-${index + 1}/640/480` : null,
    isVisible: index % 17 !== 0,
    createdAt: addHours(orderBuild.orders.find((order) => order.orderId === item.orderId)?.updatedAt ?? operationalNow, 8)
  }));

  await prisma.review.createMany({ data: reviews });

  const ratingByProduct = new Map<string, { total: number; count: number }>();
  reviews.forEach((review) => {
    const item = orderBuild.orderItems.find((orderItem) => orderItem.orderItemId === review.orderItemId);
    if (!item) return;

    const current = ratingByProduct.get(item.productId) ?? { total: 0, count: 0 };
    current.total += review.rating;
    current.count += 1;
    ratingByProduct.set(item.productId, current);
  });

  for (const [productId, rating] of ratingByProduct.entries()) {
    await prisma.product.update({
      where: { productId },
      data: {
        avgRating: (rating.total / rating.count).toFixed(2)
      }
    });
  }
}

async function seedVoucherInventory(coupons: CouponSeed[]) {
  const couponByCode = new Map(coupons.map((coupon) => [coupon.code, coupon.couponId]));
  await prisma.voucherInventory.createMany({
    data: [
      {
        voucherTemplateId: seededUuid("voucher-template:bronze"),
        tier: "bronze",
        couponId: couponByCode.get("BIRTHDAY30") as string,
        quantityPerMonth: 1,
        isActive: true
      },
      {
        voucherTemplateId: seededUuid("voucher-template:silver"),
        tier: "silver",
        couponId: couponByCode.get("SAVE50K") as string,
        quantityPerMonth: 2,
        isActive: true
      },
      {
        voucherTemplateId: seededUuid("voucher-template:gold"),
        tier: "gold",
        couponId: couponByCode.get("MEMBER15") as string,
        quantityPerMonth: 2,
        isActive: true
      },
      {
        voucherTemplateId: seededUuid("voucher-template:diamond"),
        tier: "diamond",
        couponId: couponByCode.get("VIP20") as string,
        quantityPerMonth: 3,
        isActive: true
      }
    ]
  });
}

async function seedAnalyticsEvents(members: Awaited<ReturnType<typeof seedUsersAndAddresses>>, orderBuild: OrderBuildResult) {
  const products = await prisma.product.findMany({
    select: {
      productId: true,
      slug: true,
      category: {
        select: {
          slug: true
        }
      }
    },
    orderBy: { slug: "asc" }
  });
  const events = [];
  const browsers = ["Chrome", "Safari", "Edge", "Firefox"];
  const osList = ["Windows", "iOS", "Android", "macOS"];
  const deviceTypes = ["desktop", "mobile", "tablet"];
  const eventFlow: AnalyticsEventType[] = ["page_view", "page_view", "click", "add_to_cart", "checkout_start"];

  for (let sessionIndex = 0; sessionIndex < 64; sessionIndex += 1) {
    const user = sessionIndex < members.length ? members[sessionIndex] : null;
    const product = products[(sessionIndex * 5) % products.length];
    const sessionId = `sess_${String(sessionIndex + 1).padStart(3, "0")}`;
    const startedAt = daysAgo(13 - Math.floor((sessionIndex / 64) * 14), 8 + (sessionIndex % 12), (sessionIndex * 3) % 60);
    const steps = 3 + (sessionIndex % 4);

    for (let step = 0; step < steps; step += 1) {
      const eventType = eventFlow[Math.min(step, eventFlow.length - 1)];
      const pageUrl =
        step === 0
          ? "/"
          : step === 1
            ? `/categories/${product.category.slug}`
            : step === 2
              ? `/products/${product.slug}`
              : step === 3
                ? "/cart"
                : "/checkout";

      events.push({
        eventId: seededUuid(`analytics:${sessionId}:${step}`),
        sessionId,
        userId: user?.userId ?? null,
        eventType,
        pageUrl,
        referrer: step === 0 ? (sessionIndex % 5 === 0 ? "https://google.com" : null) : "/",
        deviceType: deviceTypes[sessionIndex % deviceTypes.length],
        os: osList[sessionIndex % osList.length],
        browser: browsers[sessionIndex % browsers.length],
        utmSource: sessionIndex % 5 === 0 ? "google" : sessionIndex % 7 === 0 ? "facebook" : null,
        utmMedium: sessionIndex % 5 === 0 ? "organic" : sessionIndex % 7 === 0 ? "social" : null,
        utmCampaign: sessionIndex % 7 === 0 ? "opening-week" : null,
        meta: {
          product_id: product.productId,
          step
        },
        createdAt: addHours(startedAt, step)
      });
    }
  }

  orderBuild.orders
    .filter((order) => order.orderStatus !== "cancelled")
    .forEach((order, index) => {
      events.push({
        eventId: seededUuid(`analytics:purchase:${order.orderId}`),
        sessionId: `order_sess_${String(index + 1).padStart(3, "0")}`,
        userId: order.userId,
        eventType: "purchase" as AnalyticsEventType,
        pageUrl: "/checkout/success",
        referrer: "/checkout",
        deviceType: deviceTypes[index % deviceTypes.length],
        os: osList[index % osList.length],
        browser: browsers[index % browsers.length],
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        meta: {
          order_id: order.orderId,
          total_amount: Number(order.totalAmount)
        },
        createdAt: addHours(order.createdAt, 1)
      });
    });

  await prisma.analyticsEvent.createMany({ data: events });
}

async function main() {
  await clearDatabase();
  await seedCatalog();
  const members = await seedUsersAndAddresses();
  const coupons = await seedCoupons();
  const orderBuild = await seedOrdersAndRelatedData(members, coupons);
  await seedReviews(orderBuild);
  await seedVoucherInventory(coupons);
  await seedAnalyticsEvents(members, orderBuild);

  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();
  const productImageCount = await prisma.productImage.count();
  const optionGroupCount = await prisma.optionGroup.count();
  const optionItemCount = await prisma.optionItem.count();
  const userCount = await prisma.user.count();
  const addressCount = await prisma.address.count();
  const couponCount = await prisma.coupon.count();
  const orderCount = await prisma.order.count();
  const orderItemCount = await prisma.orderItem.count();
  const reviewCount = await prisma.review.count();
  const loyaltyLogCount = await prisma.loyaltyLog.count();
  const membershipCycleCount = await prisma.membershipCycle.count();
  const voucherInventoryCount = await prisma.voucherInventory.count();
  const analyticsEventCount = await prisma.analyticsEvent.count();

  console.log("Seed completed", {
    categories: categoryCount,
    products: productCount,
    productImages: productImageCount,
    optionGroups: optionGroupCount,
    optionItems: optionItemCount,
    users: userCount,
    addresses: addressCount,
    coupons: couponCount,
    orders: orderCount,
    orderItems: orderItemCount,
    reviews: reviewCount,
    loyaltyLogs: loyaltyLogCount,
    membershipCycles: membershipCycleCount,
    voucherInventory: voucherInventoryCount,
    analyticsEvents: analyticsEventCount
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
