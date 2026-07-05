import { Component, OnDestroy, computed, signal } from '@angular/core';

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
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  templateUrl: './hero-carousel.component.html',
  styleUrl: './hero-carousel.component.scss',
})
export class HeroCarouselComponent implements OnDestroy {
  readonly banners = signal<HeroBannerSlide[]>(HOME_BANNERS);
  readonly current = signal(0);
  readonly slideCount = computed(() => this.banners().length);

  private timer: ReturnType<typeof setInterval> | null = null;
  private pointerStartX: number | null = null;

  constructor() {
    this.startRotation();
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
