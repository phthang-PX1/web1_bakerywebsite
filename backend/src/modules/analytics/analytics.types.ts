import type { AnalyticsEventType, Prisma } from "@prisma/client";

export type AnalyticsEventInput = {
  sessionId: string;
  eventType: AnalyticsEventType;
  pageUrl: string;
  referrer?: string;
  deviceType: string;
  os: string;
  browser: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  meta?: Prisma.InputJsonValue;
};

export type AnalyticsBatchInput = {
  events: AnalyticsEventInput[];
};

export type AnalyticsRangeQuery = {
  dateFrom: Date;
  dateTo: Date;
};

export type AnalyticsBehaviorQuery = AnalyticsRangeQuery & {
  limit: number;
};
