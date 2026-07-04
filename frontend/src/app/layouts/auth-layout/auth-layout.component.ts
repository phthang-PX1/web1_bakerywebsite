import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ToastComponent],
  template: `
    <div class="auth-layout">
      <header class="auth-header">
        <a class="auth-logo" routerLink="/">WeBee</a>
      </header>
      <main class="auth-main">
        <router-outlet />
      </main>
      <app-toast />
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    .auth-layout { min-height: 100dvh; display: flex; flex-direction: column; background: t.$paper; }
    .auth-header { padding: 20px 24px; border-bottom: 1px solid t.$border; }
    .auth-logo { font-family: t.$font-display; font-style: italic; font-size: 24px; font-weight: 550; color: t.$ink; text-decoration: none; }
    .auth-logo:hover { color: t.$primary; }
    .auth-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 16px; }
  `],
})
export class AuthLayoutComponent {}
