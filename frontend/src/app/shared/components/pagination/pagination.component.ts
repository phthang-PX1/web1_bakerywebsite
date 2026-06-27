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
    .pagination { display: flex; gap: 4px; justify-content: center; align-items: center; padding: 24px 0; }
    .pagination__btn {
      min-width: 36px; height: 36px; padding: 0 8px;
      border: 1px solid #e5e7eb; border-radius: 6px;
      background: #fff; cursor: pointer; font-size: 14px; color: #1a1a1a;
      transition: all 0.15s;
    }
    .pagination__btn:hover:not(:disabled) { border-color: #C96A2E; color: #C96A2E; }
    .pagination__btn--active { background: #C96A2E; color: #fff; border-color: #C96A2E; }
    .pagination__btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .pagination__ellipsis { padding: 0 4px; color: #6b6b6b; }
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
