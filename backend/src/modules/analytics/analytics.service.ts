import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { toMoney } from "../../utils/money";
import type {
  AnalyticsBatchInput,
  AnalyticsBehaviorQuery,
  AnalyticsRangeQuery
} from "./analytics.types";

const getGroupCount = (
  count: true | Record<string, number | undefined> | undefined
) => {
  if (!count || count === true) return 0;
  return count._all ?? 0;
};

const buildDateWhere = (query: AnalyticsRangeQuery) => ({
  gte: query.dateFrom,
  lte: query.dateTo
});

export const recordAnalyticsEvents = async (
  input: AnalyticsBatchInput,
  authenticatedUserId?: string
) => {
  await prisma.analyticsEvent.createMany({
    data: input.events.map((event) => ({
      sessionId: event.sessionId,
      userId: authenticatedUserId,
      eventType: event.eventType,
      pageUrl: event.pageUrl,
      referrer: event.referrer,
      deviceType: event.deviceType,
      os: event.os,
      browser: event.browser,
      utmSource: event.utmSource,
      utmMedium: event.utmMedium,
      utmCampaign: event.utmCampaign,
      meta:
        event.meta === undefined
          ? undefined
          : event.meta === null
            ? Prisma.JsonNull
            : event.meta
    }))
  });
};

export const getAnalyticsOverview = async (query: AnalyticsRangeQuery) => {
  const createdAt = buildDateWhere(query);
  const paidOrderWhere: Prisma.OrderWhereInput = {
    createdAt,
    paymentStatus: "paid",
    orderStatus: { not: "cancelled" }
  };
  const activeOrderWhere: Prisma.OrderWhereInput = {
    createdAt,
    orderStatus: { not: "cancelled" }
  };

  const [
    revenueAggregate,
    totalOrders,
    newCustomers,
    topProductRows
  ] = await prisma.$transaction([
    prisma.order.aggregate({
      where: paidOrderWhere,
      _sum: { totalAmount: true }
    }),
    prisma.order.count({ where: activeOrderWhere }),
    prisma.user.count({
      where: {
        role: "member",
        createdAt
      }
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productNameSnapshot"],
      where: {
        order: paidOrderWhere
      },
      _sum: {
        quantity: true,
        itemTotal: true
      },
      orderBy: {
        _sum: {
          itemTotal: "desc"
        }
      },
      take: 5
    })
  ]);

  const productIds = topProductRows.map((row) => row.productId);
  const products = await prisma.product.findMany({
    where: { productId: { in: productIds } },
    select: {
      productId: true,
      thumbnailUrl: true,
      category: {
        select: {
          name: true
        }
      }
    }
  });

  const productMap = new Map(products.map((p) => [p.productId, p]));

  return {
    range: {
      dateFrom: query.dateFrom,
      dateTo: query.dateTo
    },
    revenue: toMoney(revenueAggregate._sum.totalAmount),
    totalOrders,
    newCustomers,
    topProducts: topProductRows.map((row) => {
      const productInfo = productMap.get(row.productId);
      return {
        productId: row.productId,
        productName: row.productNameSnapshot,
        quantitySold: row._sum?.quantity ?? 0,
        revenue: toMoney(row._sum?.itemTotal),
        imageUrl: productInfo?.thumbnailUrl || "",
        category: productInfo?.category?.name || "--"
      };
    })
  };
};

export const getAnalyticsBehavior = async (query: AnalyticsBehaviorQuery) => {
  const createdAt = buildDateWhere(query);
  const where: Prisma.AnalyticsEventWhereInput = { createdAt };

  const [eventTypes, utmSources, pages] = await prisma.$transaction([
    prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      where,
      _count: { _all: true },
      orderBy: {
        _count: {
          eventId: "desc"
        }
      }
    }),
    prisma.analyticsEvent.groupBy({
      by: ["utmSource"],
      where: {
        ...where,
        utmSource: { not: null }
      },
      _count: { _all: true },
      orderBy: {
        _count: {
          eventId: "desc"
        }
      },
      take: query.limit
    }),
    prisma.analyticsEvent.groupBy({
      by: ["pageUrl"],
      where,
      _count: { _all: true },
      orderBy: {
        _count: {
          eventId: "desc"
        }
      },
      take: query.limit
    })
  ]);

  return {
    range: {
      dateFrom: query.dateFrom,
      dateTo: query.dateTo
    },
    byEventType: eventTypes.map((row) => ({
      eventType: row.eventType,
      count: getGroupCount(row._count)
    })),
    byUtmSource: utmSources.map((row) => ({
      utmSource: row.utmSource,
      count: getGroupCount(row._count)
    })),
    byPageUrl: pages.map((row) => ({
      pageUrl: row.pageUrl,
      count: getGroupCount(row._count)
    }))
  };
};

// ─── Time-series & phân bổ cho dashboard/báo cáo (Phase 2) ───────────────────

type RevenueTrendRow = {
  date: Date;
  revenue: Prisma.Decimal | number | null;
  orders: bigint | number;
};

/**
 * Doanh thu + số đơn theo TỪNG NGÀY trong khoảng. Doanh thu tính trên đơn đã
 * thanh toán (paid, không huỷ); số đơn tính trên đơn không huỷ. Dùng $queryRaw
 * + generate_series để trả về đủ mọi ngày (kể cả ngày 0 đơn) → biểu đồ liền mạch.
 */
export const getRevenueTrend = async (query: AnalyticsRangeQuery) => {
  const rows = await prisma.$queryRaw<RevenueTrendRow[]>`
    SELECT
      d::date AS date,
      COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) AS revenue,
      COUNT(o.order_id) AS orders
    FROM generate_series(${query.dateFrom}::date, ${query.dateTo}::date, '1 day') AS d
    LEFT JOIN orders o
      ON o.created_at::date = d::date
      AND o.order_status <> 'cancelled'
    GROUP BY d
    ORDER BY d ASC
  `;

  return {
    range: { dateFrom: query.dateFrom, dateTo: query.dateTo },
    points: rows.map((row) => ({
      date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10),
      revenue: toMoney(row.revenue ?? 0),
      orders: Number(row.orders)
    }))
  };
};

/** Phân bổ số đơn theo trạng thái trong khoảng (dùng cho donut/thanh trạng thái). */
export const getOrderStatusDistribution = async (query: AnalyticsRangeQuery) => {
  const createdAt = buildDateWhere(query);
  const rows = await prisma.order.groupBy({
    by: ["orderStatus"],
    where: { createdAt },
    _count: { _all: true }
  });

  const total = rows.reduce((sum, row) => sum + getGroupCount(row._count), 0);

  return {
    range: { dateFrom: query.dateFrom, dateTo: query.dateTo },
    total,
    byStatus: rows.map((row) => ({
      status: row.orderStatus,
      count: getGroupCount(row._count)
    }))
  };
};

/** Doanh thu + số lượng bán theo danh mục (đơn đã thanh toán) — cho donut danh mục. */
export const getCategoryDistribution = async (query: AnalyticsRangeQuery) => {
  const createdAt = buildDateWhere(query);
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt,
        paymentStatus: "paid",
        orderStatus: { not: "cancelled" }
      }
    },
    select: {
      quantity: true,
      itemTotal: true,
      product: {
        select: {
          category: { select: { categoryId: true, name: true } }
        }
      }
    }
  });

  const byCategory = new Map<
    string,
    { categoryId: string; name: string; revenue: number; quantity: number }
  >();

  for (const item of items) {
    const category = item.product?.category;
    const key = category?.categoryId ?? "unknown";
    const name = category?.name ?? "Khác";
    const current =
      byCategory.get(key) ?? { categoryId: key, name, revenue: 0, quantity: 0 };
    current.revenue += toMoney(item.itemTotal);
    current.quantity += item.quantity;
    byCategory.set(key, current);
  }

  const list = Array.from(byCategory.values()).sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = list.reduce((sum, c) => sum + c.revenue, 0);

  return {
    range: { dateFrom: query.dateFrom, dateTo: query.dateTo },
    totalRevenue,
    byCategory: list
  };
};

/** Phân bổ số khách hàng (member) theo hạng thành viên — cho báo cáo tier. */
export const getTierDistribution = async () => {
  const rows = await prisma.user.groupBy({
    by: ["membershipTier"],
    where: { role: "member" },
    _count: { _all: true }
  });

  const total = rows.reduce((sum, row) => sum + getGroupCount(row._count), 0);

  return {
    total,
    byTier: rows.map((row) => ({
      tier: row.membershipTier,
      count: getGroupCount(row._count)
    }))
  };
};

/**
 * Thống kê tích điểm từ bảng loyaltyLog: tổng điểm đã cấp (delta dương),
 * điểm đã quy đổi voucher (delta âm), và điểm trung bình mỗi khách có tích điểm.
 */
export const getLoyaltyStats = async () => {
  const [grantedAgg, redeemedAgg, distinctUsers] = await Promise.all([
    prisma.loyaltyLog.aggregate({
      where: { pointsDelta: { gt: 0 } },
      _sum: { pointsDelta: true }
    }),
    prisma.loyaltyLog.aggregate({
      where: { pointsDelta: { lt: 0 } },
      _sum: { pointsDelta: true }
    }),
    prisma.loyaltyLog.findMany({
      where: { pointsDelta: { gt: 0 } },
      distinct: ["userId"],
      select: { userId: true }
    })
  ]);

  const totalGranted = grantedAgg._sum.pointsDelta ?? 0;
  const totalRedeemed = Math.abs(redeemedAgg._sum.pointsDelta ?? 0);
  const usersWithPoints = distinctUsers.length;
  const avgFrequency =
    usersWithPoints > 0 ? Math.round((totalGranted / usersWithPoints) * 10) / 10 : 0;

  return { totalGranted, totalRedeemed, usersWithPoints, avgFrequency };
};
