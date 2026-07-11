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
