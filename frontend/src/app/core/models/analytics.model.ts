export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'search';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface AnalyticsBatchRequest {
  events: AnalyticsEvent[];
}
