import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="spinner-wrap" [ngClass]="{ 'spinner-wrap--fullpage': fullPage() }">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 32px;
    }
    .spinner-wrap--fullpage {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.8);
      z-index: 9000;
      padding: 0;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #F5E6D3;
      border-top-color: #C96A2E;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class LoadingSpinnerComponent {
  readonly fullPage = input(false);
}
