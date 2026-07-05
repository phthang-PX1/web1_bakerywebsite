import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BannersApi } from '../../../../core/api/banners.api';
import type { Banner } from '../../../../core/models/banner.model';
import { HeroBannerComponent } from '../hero-banner/hero-banner.component';

const ROTATE_INTERVAL_MS = 6000;

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [HeroBannerComponent],
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.scss',
})
export class HeroCarouselComponent {
  private readonly bannersApi = inject(BannersApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly banners = signal<Banner[]>([]);
  readonly current = signal(0);
  /** Slide 0 is the editorial hero; banners follow. */
  readonly slideCount = computed(() => this.banners().length + 1);

  private timer: ReturnType<typeof setInterval> | null = null;
  private pointerStartX: number | null = null;

  constructor() {
    this.bannersApi.getBanners()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (banners) => {
          this.banners.set(banners);
          if (banners.length > 0) this.startRotation();
        },
        error: () => {}, // API unavailable → static hero only
      });

    this.destroyRef.onDestroy(() => this.stopRotation());
  }

  goTo(index: number): void {
    const count = this.slideCount();
    this.current.set(((index % count) + count) % count);
  }

  next(): void { this.goTo(this.current() + 1); }
  prev(): void { this.goTo(this.current() - 1); }

  startRotation(): void {
    this.stopRotation();
    if (this.slideCount() <= 1) return;
    this.timer = setInterval(() => this.next(), ROTATE_INTERVAL_MS);
  }

  stopRotation(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onPointerDown(event: PointerEvent): void {
    this.pointerStartX = event.clientX;
  }

  onPointerUp(event: PointerEvent): void {
    if (this.pointerStartX === null) return;
    const delta = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) this.next();
    else this.prev();
  }

  openBanner(banner: Banner): void {
    if (!banner.linkUrl) return;
    if (banner.linkUrl.startsWith('/')) {
      this.router.navigateByUrl(banner.linkUrl);
    } else {
      window.open(banner.linkUrl, '_blank', 'noopener');
    }
  }
}
