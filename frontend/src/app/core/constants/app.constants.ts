export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'webee_access_token',
  REFRESH_TOKEN: 'webee_refresh_token',
} as const;

export const TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '13:00-15:00',
  '15:00-17:00',
  '17:00-19:00',
] as const;

export const MAX_CART_QUANTITY = 99;
export const TOAST_DURATION_MS = 4000;
export const ANALYTICS_FLUSH_INTERVAL_MS = 10_000;
export const ANALYTICS_FLUSH_BATCH_SIZE = 20;
export const CART_POLLING_INTERVAL_MS = 3_000;
