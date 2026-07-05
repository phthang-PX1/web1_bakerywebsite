import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ToastComponent],
  template: `
    <div class="auth-layout">
      <!-- Brand panel -->
      <aside class="auth-brand">
        <a class="auth-brand__logo" routerLink="/" aria-label="Về trang chủ WeBee">
          <img src="/assets/webee-logo.png" alt="" />
          <span>WeBee</span>
        </a>

        <blockquote class="auth-brand__quote">
          Gói trọn <em>ngọt ngào</em><br />
          trong từng chiếc bánh<br />
          làm thủ công mỗi sáng.
        </blockquote>

        <div class="auth-brand__meta">
          <span>Est. 2018</span>
          <span aria-hidden="true">·</span>
          <span>TP. Hồ Chí Minh</span>
        </div>

        <div class="auth-brand__arch" aria-hidden="true"></div>
      </aside>

      <!-- Form panel -->
      <main class="auth-main">
        <a class="auth-main__back" routerLink="/">← Về trang chủ</a>
        <div class="auth-main__inner">
          <router-outlet />
        </div>
      </main>
    </div>
    <app-toast />
  `,
  styles: [`
    @use "tokens" as t;

    // Lock the layout to exactly one viewport: the brand panel stays fixed
    // and the form column scrolls internally if it ever overflows.
    .auth-layout {
      display: grid;
      grid-template-columns: 5fr 7fr;
      height: 100dvh;
      overflow: hidden;
      background: t.$paper;
    }

    // --- Brand panel ------------------------------------------------------
    .auth-brand {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      background: t.$ink;
      color: t.$cream-text;
      padding: 40px 48px 48px;
    }

    .auth-brand__logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      z-index: 1;
    }

    .auth-brand__logo img {
      height: 52px;
      width: auto;
    }

    .auth-brand__logo span {
      font-family: t.$font-display;
      font-style: italic;
      font-size: 1.6rem;
      font-weight: 550;
      color: t.$accent;
    }

    .auth-brand__quote {
      margin: 0;
      font-family: t.$font-display;
      font-size: clamp(1.6rem, 2.4vw, 2.4rem);
      font-weight: 450;
      line-height: 1.25;
      color: t.$paper;
      z-index: 1;
    }

    .auth-brand__quote em {
      font-style: italic;
      color: t.$accent;
    }

    .auth-brand__meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(232, 221, 213, 0.6);
      z-index: 1;
    }

    // Signature arch shape glowing softly behind the copy
    .auth-brand__arch {
      position: absolute;
      right: -70px;
      bottom: -40px;
      width: 300px;
      height: 400px;
      border: 1px solid rgba(245, 200, 66, 0.35);
      border-radius: 999px 999px 0 0;
      background: rgba(245, 200, 66, 0.05);
    }

    // --- Form panel ---------------------------------------------------------
    .auth-main {
      display: flex;
      flex-direction: column;
      padding: 28px 32px;
      overflow-y: auto;
    }

    .auth-main__back {
      align-self: flex-start;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: t.$muted;
      text-decoration: none;
    }

    .auth-main__back:hover { color: t.$primary; }

    .auth-main__inner {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 0;
    }

    // --- Responsive -----------------------------------------------------------
    @media (max-width: 1023px) {
      .auth-layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }

      .auth-brand {
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 20px;
        padding: 14px 20px;
      }

      .auth-brand__logo img { height: 40px; }
      .auth-brand__quote, .auth-brand__meta, .auth-brand__arch { display: none; }
    }
  `],
})
export class AuthLayoutComponent {}
