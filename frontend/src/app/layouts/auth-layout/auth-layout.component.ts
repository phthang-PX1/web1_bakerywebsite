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
    .auth-layout { min-height: 100dvh; display: flex; flex-direction: column; background: #FDFAF6; }
    .auth-header { padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
    .auth-logo { font-size: 22px; font-weight: 900; color: #C96A2E; text-decoration: none; }
    .auth-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 16px; }
  `],
})
export class AuthLayoutComponent {}
