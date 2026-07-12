import { Injectable, OnDestroy, inject } from '@angular/core';
import {
  ANALYTICS_FLUSH_BATCH_SIZE,
  ANALYTICS_FLUSH_INTERVAL_MS,
} from '../constants/app.constants';
import { environment } from '../../../environments/environment';
import type { AnalyticsEvent, AnalyticsEventType } from '../models/analytics.model';
import { AnalyticsApi } from '../api/analytics.api';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService implements OnDestroy {
  private readonly analyticsApi = inject(AnalyticsApi);
  private readonly sessionService = inject(SessionService);
  private buffer: AnalyticsEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.timer = setInterval(() => this.flush(), ANALYTICS_FLUSH_INTERVAL_MS);
    window.addEventListener('beforeunload', this.onUnload);
  }

  track(eventType: AnalyticsEventType, meta: Record<string, unknown> = {}): void {
    this.buffer.push(this.buildEvent(eventType, meta));
    // Backend giới hạn 20 event/batch → flush khi đạt ngưỡng để không bao giờ vượt.
    if (this.buffer.length >= ANALYTICS_FLUSH_BATCH_SIZE) {
      this.flush();
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener('beforeunload', this.onUnload);
  }

  private buildEvent(
    eventType: AnalyticsEventType,
    meta: Record<string, unknown>,
  ): AnalyticsEvent {
    const ua = navigator.userAgent;
    const params = new URLSearchParams(window.location.search);
    return {
      session_id: this.sessionService.getSessionId(),
      event_type: eventType,
      page_url: window.location.href.slice(0, 500),
      referrer: document.referrer ? document.referrer.slice(0, 500) : undefined,
      device_type: this.detectDeviceType(ua),
      os: this.detectOs(ua),
      browser: this.detectBrowser(ua),
      utm_source: params.get('utm_source') ?? undefined,
      utm_medium: params.get('utm_medium') ?? undefined,
      utm_campaign: params.get('utm_campaign') ?? undefined,
      meta: Object.keys(meta).length ? meta : undefined,
    };
  }

  private detectDeviceType(ua: string): string {
    if (/mobile|iphone|android.*mobile/i.test(ua)) return 'mobile';
    if (/ipad|tablet|android/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private detectOs(ua: string): string {
    if (/windows/i.test(ua)) return 'Windows';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad|ipod|ios/i.test(ua)) return 'iOS';
    if (/mac os/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }

  private detectBrowser(ua: string): string {
    if (/edg\//i.test(ua)) return 'Edge';
    if (/chrome|crios/i.test(ua)) return 'Chrome';
    if (/firefox|fxios/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua)) return 'Safari';
    return 'Unknown';
  }

  private flush(): void {
    if (!this.buffer.length) return;
    // Không vượt quá giới hạn 20/batch của backend.
    const events = this.buffer.splice(0, ANALYTICS_FLUSH_BATCH_SIZE);
    this.analyticsApi.sendEvents({ events }).subscribe({ error: () => {} });
  }

  private readonly onUnload = (): void => {
    if (!this.buffer.length) return;
    const events = this.buffer.splice(0, ANALYTICS_FLUSH_BATCH_SIZE);
    const url = `${environment.apiUrl}/analytics/events/batch`;
    const blob = new Blob([JSON.stringify({ events })], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  };
}
