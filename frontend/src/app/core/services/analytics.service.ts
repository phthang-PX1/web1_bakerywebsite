import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  ANALYTICS_FLUSH_BATCH_SIZE,
  ANALYTICS_FLUSH_INTERVAL_MS,
} from '../constants/app.constants';
import type { AnalyticsEvent, AnalyticsEventType } from '../models/analytics.model';
import { AnalyticsApi } from '../api/analytics.api';

@Injectable({ providedIn: 'root' })
export class AnalyticsService implements OnDestroy {
  private readonly analyticsApi = inject(AnalyticsApi);
  private buffer: AnalyticsEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.timer = setInterval(() => this.flush(), ANALYTICS_FLUSH_INTERVAL_MS);
    window.addEventListener('beforeunload', this.onUnload);
  }

  track(eventType: AnalyticsEventType, payload: Record<string, unknown> = {}): void {
    this.buffer.push({ eventType, payload, timestamp: performance.now() });
    if (this.buffer.length >= ANALYTICS_FLUSH_BATCH_SIZE) {
      this.flush();
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener('beforeunload', this.onUnload);
  }

  private flush(): void {
    if (!this.buffer.length) return;
    const events = this.buffer.splice(0);
    this.analyticsApi.sendEvents({ events }).subscribe({ error: () => {} });
  }

  private readonly onUnload = (): void => {
    if (!this.buffer.length) return;
    const url = `${window.location.origin}/api/analytics/events/batch`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigator.sendBeacon(url, JSON.stringify({ events: this.buffer }));
    this.buffer = [];
  };
}
