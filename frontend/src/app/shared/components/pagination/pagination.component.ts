import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgClass],
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" aria-label="Phân trang">
        <button class="pagination__btn" [disabled]="currentPage() === 1" (click)="onPage(currentPage() - 1)">‹</button>
        @for (page of pages(); track page) {
          @if (page === -1) {
            <span class="pagination__ellipsis">…</span>
          } @else {
            <button
              class="pagination__btn"
              [ngClass]="{ 'pagination__btn--active': page === currentPage() }"
              (click)="onPage(page)"
            >{{ page }}</button>
          }
        }
        <button class="pagination__btn" [disabled]="currentPage() === totalPages()" (click)="onPage(currentPage() + 1)">›</button>
      </nav>
    }
  `,
  styles: [`
    @use "tokens" as t;
    .pagination { display: flex; gap: 14px; justify-content: center; align-items: center; padding: 32px 0; }
    .pagination__btn {
      min-width: 30px; height: 34px; padding: 0 4px;
      border: none; background: none; cursor: pointer;
      font-family: t.$font-display; font-size: 16px; color: t.$muted;
      transition: color 0.15s;
    }
    .pagination__btn:hover:not(:disabled) { color: t.$primary; }
    .pagination__btn--active {
      color: t.$ink;
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-thickness: 1px;
      text-decoration-color: t.$caramel;
    }
    .pagination__btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .pagination__ellipsis { color: t.$muted; }
  `],
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const result: number[] = [1];
    if (current > 3) result.push(-1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) result.push(i);
    if (current < total - 2) result.push(-1);
    result.push(total);
    return result;
  });

  onPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.pageChange.emit(page);
  }
}
