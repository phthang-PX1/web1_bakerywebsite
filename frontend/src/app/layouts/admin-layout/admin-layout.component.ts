import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { AuthService } from '../../core/services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, AsyncPipe],
  template: `
    <div class="admin-layout">
      <aside class="sidebar" [class.sidebar--open]="isSidebarOpen()">
        <div class="sidebar__logo">
          <a routerLink="/">WeBee Admin</a>
          <button class="sidebar__close" (click)="isSidebarOpen.set(false)">✕</button>
        </div>
        <nav class="sidebar__nav">
          <a routerLink="/admin" routerLinkActive="sidebar__link--active" [routerLinkActiveOptions]="{ exact: true }" class="sidebar__link">
            📊 Tổng quan
          </a>
          <a routerLink="/admin/products" routerLinkActive="sidebar__link--active" class="sidebar__link">
            🧁 Sản phẩm
          </a>
          <a routerLink="/admin/orders" routerLinkActive="sidebar__link--active" class="sidebar__link">
            📦 Đơn hàng
          </a>
          <a routerLink="/admin/coupons" routerLinkActive="sidebar__link--active" class="sidebar__link">
            🎟️ Mã giảm giá
          </a>
          <a routerLink="/admin/banners" routerLinkActive="sidebar__link--active" class="sidebar__link">
            🖼️ Banner
          </a>
        </nav>
      </aside>

      <div class="admin-content">
        <header class="admin-topbar">
          <button class="topbar__menu-btn" (click)="isSidebarOpen.set(true)" aria-label="Mở menu">☰</button>
          <span class="topbar__title">Quản trị WeBee</span>
          @if (authService.currentUser$ | async; as user) {
            <span class="topbar__user">{{ user.fullName }}</span>
          }
        </header>
        <main class="admin-main">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-toast />
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100dvh; }
    .sidebar {
      width: 240px; flex-shrink: 0; background: #1a1a2e; color: #fff;
      display: flex; flex-direction: column;
    }
    .sidebar__logo { padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; }
    .sidebar__logo a { color: #E8B86D; font-size: 18px; font-weight: 700; text-decoration: none; }
    .sidebar__close { display: none; background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; }
    .sidebar__nav { padding: 16px 0; display: flex; flex-direction: column; }
    .sidebar__link { padding: 12px 20px; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; transition: all 0.15s; }
    .sidebar__link:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .sidebar__link--active { background: rgba(201,106,46,0.2); color: #E8B86D; border-right: 3px solid #C96A2E; }
    .admin-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .admin-topbar { height: 60px; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; padding: 0 24px; gap: 16px; }
    .topbar__menu-btn { display: none; background: none; border: none; font-size: 20px; cursor: pointer; }
    .topbar__title { font-weight: 700; font-size: 16px; flex: 1; }
    .topbar__user { font-size: 14px; color: #6b6b6b; }
    .admin-main { flex: 1; padding: 24px; background: #f9fafb; overflow-y: auto; }
    @media (max-width: 768px) {
      .sidebar { position: fixed; left: -240px; top: 0; bottom: 0; z-index: 200; transition: left 0.3s; }
      .sidebar--open { left: 0; }
      .sidebar__close { display: block; }
      .topbar__menu-btn { display: block; }
    }
  `],
})
export class AdminLayoutComponent {
  readonly authService = inject(AuthService);
  readonly isSidebarOpen = signal(false);
}
