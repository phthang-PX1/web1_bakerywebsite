import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-custom-cake-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ToastComponent],
  template: `
    <div class="cc-layout">
      <header class="cc-header">
        <a class="cc-logo" routerLink="/">WeBee</a>
        <h1 class="cc-title">Tùy chỉnh bánh</h1>
        <a class="cc-cart-link" routerLink="/cart">Xem giỏ hàng</a>
      </header>
      <main class="cc-main">
        <router-outlet />
      </main>
    </div>
    <app-toast />
  `,
  styles: [`
    .cc-layout { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
    .cc-header { height: 60px; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; padding: 0 24px; gap: 16px; flex-shrink: 0; }
    .cc-logo { font-weight: 900; color: #C96A2E; text-decoration: none; font-size: 18px; }
    .cc-title { flex: 1; text-align: center; font-size: 16px; font-weight: 700; margin: 0; }
    .cc-cart-link { font-size: 14px; color: #C96A2E; text-decoration: none; font-weight: 600; }
    .cc-main { flex: 1; overflow: hidden; }
  `],
})
export class CustomCakeLayoutComponent {}
