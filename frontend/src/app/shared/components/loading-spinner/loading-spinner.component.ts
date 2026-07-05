import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="spinner-wrap" [ngClass]="{ 'spinner-wrap--fullpage': fullPage(), 'spinner-wrap--inline': inline() }">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    .spinner-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 32px;
    }
    .spinner-wrap--fullpage {
      position: fixed;
      inset: 0;
      background: rgba(253, 251, 245, 0.85);
      z-index: 9000;
      padding: 0;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 2px solid t.$sand;
      border-top-color: t.$primary;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    // Compact variant for use inside buttons — must not change their size.
    .spinner-wrap--inline {
      display: inline-flex;
      padding: 0;
    }
    .spinner-wrap--inline .spinner {
      width: 18px;
      height: 18px;
      border-color: rgba(253, 251, 245, 0.35);
      border-top-color: t.$paper;
    }
  `],
})
export class LoadingSpinnerComponent {
  readonly fullPage = input(false);
  readonly inline = input(false);
}
