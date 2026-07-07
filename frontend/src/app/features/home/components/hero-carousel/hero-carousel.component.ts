import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BannersApi } from '../../../../core/api/banners.api';

const ROTATE_INTERVAL_MS = 6000;
const HOME_BANNERS: HeroBannerSlide[] = [
  {
    id: 'home-banner-1',
    title: 'WeBee banner 1',
    imageUrl: '/assets/images/banner1.png',
  },
  {
    id: 'home-banner-2',
    title: 'WeBee banner 2',
    imageUrl: '/assets/images/banner2.png',
  },
];

interface HeroBannerSlide {
  readonly id: string;
  readonly title: string;
  readonly imageUrl: string;
  readonly linkUrl?: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  private readonly bannersApi = inject(BannersApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly banners = signal<HeroBannerSlide[]>(HOME_BANNERS);
  readonly current = signal(0);
  readonly slideCount = computed(() => this.banners().length);

  private timer: ReturnType<typeof setInterval> | null = null;
  private pointerStartX: number | null = null;

  constructor() {
    this.startRotation();
  }

  ngOnInit(): void {
    this.bannersApi.getBanners().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => {
        const active = res.filter(b => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
        if (active.length > 0) {
          this.banners.set(active.map(b => ({
            id: b.bannerId,
            title: b.title,
            imageUrl: b.imageUrl,
            linkUrl: b.linkUrl ?? undefined,
          })));
          this.startRotation();
        }
      },
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    this.stopRotation();
  }

  goTo(index: number): void {
    const count = this.slideCount();
    if (count === 0) return;
    this.current.set(((index % count) + count) % count);
  }

  next(): void {
    this.goTo(this.current() + 1);
  }

  prev(): void {
    this.goTo(this.current() - 1);
  }

  startRotation(): void {
    this.stopRotation();
    if (this.slideCount() <= 1) return;
    this.timer = setInterval(() => this.next(), ROTATE_INTERVAL_MS);
  }

  stopRotation(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
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
}
