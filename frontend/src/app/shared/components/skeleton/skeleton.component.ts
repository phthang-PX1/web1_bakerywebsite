import { Component, input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgStyle],
  template: `
    <div
      class="skeleton"
      [ngStyle]="{
        'width': width(),
        'height': height(),
        'border-radius': borderRadius()
      }"
      role="status"
      aria-label="Đang tải dữ liệu..."
    ></div>
  `,
  styles: [`
    @use "tokens" as t;

    .skeleton {
      background: linear-gradient(
        90deg,
        t.$border 0%,
        t.$paper 50%,
        t.$border 100%
      );
      background-size: 200% 100%;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
      display: inline-block;
    }

    @keyframes skeleton-pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('20px');
  readonly borderRadius = input<string>('4px');
}
