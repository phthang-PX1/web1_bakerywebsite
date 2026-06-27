import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="stars" [attr.aria-label]="rating() + ' sao'">
      @for (star of stars(); track $index) {
        <span class="star" [class.star--full]="star === 'full'" [class.star--half]="star === 'half'">★</span>
      }
      @if (showCount() && reviewCount() > 0) {
        <span class="stars__count">({{ reviewCount() }})</span>
      }
    </div>
  `,
  styles: [`
    .stars { display: flex; align-items: center; gap: 2px; }
    .star { font-size: var(--star-size, 16px); color: #d1d5db; }
    .star--full, .star--half { color: #f59e0b; }
    .stars__count { font-size: 13px; color: #6b6b6b; margin-left: 4px; }
  `],
})
export class StarRatingComponent {
  readonly rating = input.required<number>();
  readonly reviewCount = input(0);
  readonly showCount = input(false);

  readonly stars = computed(() => {
    const r = Math.min(5, Math.max(0, this.rating()));
    return Array.from({ length: 5 }, (_, i) => {
      if (i + 1 <= Math.floor(r)) return 'full';
      if (i < r) return 'half';
      return 'empty';
    });
  });
}
