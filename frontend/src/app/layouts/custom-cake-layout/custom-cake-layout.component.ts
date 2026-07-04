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
    @use "tokens" as t;
    .cc-layout { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
    .cc-header { height: 60px; background: t.$paper; border-bottom: 1px solid t.$border; display: flex; align-items: center; padding: 0 24px; gap: 16px; flex-shrink: 0; }
    .cc-logo { font-family: t.$font-display; font-style: italic; font-weight: 550; color: t.$ink; text-decoration: none; font-size: 20px; }
    .cc-logo:hover { color: t.$primary; }
    .cc-title { flex: 1; text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: t.$ink; margin: 0; }
    .cc-cart-link { font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: t.$ink; text-decoration: underline; text-underline-offset: 5px; text-decoration-thickness: 1px; }
    .cc-cart-link:hover { color: t.$primary; }
    .cc-main { flex: 1; overflow: hidden; }
  `],
})
export class CustomCakeLayoutComponent {}
