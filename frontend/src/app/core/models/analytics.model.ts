// Contract phải khớp backend/src/modules/analytics/analytics.schema.ts
export type AnalyticsEventType =
  | 'page_view'
  | 'click'
  | 'add_to_cart'
  | 'checkout_start'
  | 'purchase';

/** Payload gửi lên backend cho mỗi event (snake_case như schema Zod yêu cầu). */
export interface AnalyticsEvent {
  session_id: string;
  event_type: AnalyticsEventType;
  page_url: string;
  referrer?: string;
  device_type: string;
  os: string;
  browser: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  meta?: Record<string, unknown>;
}

export interface AnalyticsBatchRequest {
  events: AnalyticsEvent[];
}
