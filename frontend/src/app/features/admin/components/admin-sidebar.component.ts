import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface SidebarItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <aside class="sidebar">
      <!-- Brand -->
      <div class="sidebar__brand">
        <img src="assets/icons/webee-logo.png" class="sidebar__logo" alt="WeBee Logo" />
        <div>
          <p class="sidebar__eyebrow">WeBee</p>
          <h2 class="sidebar__brand-name">Admin Center</h2>
        </div>
      </div>

      <!-- Nav -->
      <nav class="sidebar__nav">
        @for (item of items; track item.path) {
          <a
            class="sidebar__link"
            [routerLink]="item.path"
            routerLinkActive="sidebar__link--active"
            [routerLinkActiveOptions]="item.path === '/admin' ? { exact: true } : { exact: false }"
          >
            <span class="sidebar__icon">
              @switch (item.icon) {
                @case ('tongquan') {
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6V0H18V6H10ZM0 10V0H8V10H0ZM10 18V8H18V18H10ZM0 18V12H8V18H0ZM2 8H6V2H2V8ZM12 16H16V10H12V16ZM12 4H16V2H12V4ZM2 16H6V14H2V16Z" fill="currentColor"/></svg>
                }
                @case ('donhang') {
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 20C5.45 20 4.97917 19.8042 4.5875 19.4125C4.19583 19.0208 4 18.55 4 18C4 17.45 4.19583 16.9792 4.5875 16.5875C4.97917 16.1958 5.45 16 6 16C6.55 16 7.02083 16.1958 7.4125 16.5875C7.80417 16.9792 8 17.45 8 18C8 18.55 7.80417 19.0208 7.4125 19.4125C7.02083 19.8042 6.55 20 6 20ZM16 20C15.45 20 14.9792 19.8042 14.5875 19.4125C14.1958 19.0208 14 18.55 14 18C14 17.45 14.1958 16.9792 14.5875 16.5875C14.9792 16.1958 15.45 16 16 16C16.55 16 17.0208 16.1958 17.4125 16.5875C17.8042 16.9792 18 17.45 18 18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20ZM5.15 4L7.55 9H14.55L17.3 4H5.15ZM4.2 2H18.95C19.3333 2 19.625 2.17083 19.825 2.5125C20.025 2.85417 20.0333 3.2 19.85 3.55L16.3 9.95C16.1167 10.2833 15.8708 10.5417 15.5625 10.725C15.2542 10.9083 14.9167 11 14.55 11H7.1L6 13H18V15H6C5.25 15 4.68333 14.6708 4.3 14.0125C3.91667 13.3542 3.9 12.7 4.25 12.05L5.6 9.6L2 2H0V0H3.25L4.2 2ZM7.55 9H14.55H7.55Z" fill="currentColor"/></svg>
                }
                @case ('sanpham') {
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 20C0.716667 20 0.479167 19.9042 0.2875 19.7125C0.0958333 19.5208 0 19.2833 0 19V14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12V8C2 7.45 2.19583 6.97917 2.5875 6.5875C2.97917 6.19583 3.45 6 4 6H8V4.55C7.7 4.35 7.45833 4.10833 7.275 3.825C7.09167 3.54167 7 3.2 7 2.8C7 2.55 7.05 2.30417 7.15 2.0625C7.25 1.82083 7.4 1.6 7.6 1.4L9 0L10.4 1.4C10.6 1.6 10.75 1.82083 10.85 2.0625C10.95 2.30417 11 2.55 11 2.8C11 3.2 10.9083 3.54167 10.725 3.825C10.5417 4.10833 10.3 4.35 10 4.55V6H14C14.55 6 15.0208 6.19583 15.4125 6.5875C15.8042 6.97917 16 7.45 16 8V12C16.55 12 17.0208 12.1958 17.4125 12.5875C17.8042 12.9792 18 13.45 18 14V19C18 19.2833 17.9042 19.5208 17.7125 19.7125C17.5208 19.9042 17.2833 20 17 20H1ZM4 12H14V8H4V12ZM2 18H16V14H2V18Z" fill="currentColor"/></svg>
                }
                @case ('danhmuc') {
                  <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 9L9 0L14.5 9H3.5ZM14.5 20C13.25 20 12.1875 19.5625 11.3125 18.6875C10.4375 17.8125 10 16.75 10 15.5C10 14.25 10.4375 13.1875 11.3125 12.3125C12.1875 11.4375 13.25 11 14.5 11C15.75 11 16.8125 11.4375 17.6875 12.3125C18.5625 13.1875 19 14.25 19 15.5C19 16.75 18.5625 17.8125 17.6875 18.6875C16.8125 19.5625 15.75 20 14.5 20ZM0 19.5V11.5H8V19.5H0ZM14.5 18C15.2 18 15.7917 17.7583 16.275 17.275C16.7583 16.7917 17 16.2 17 15.5C17 14.8 16.7583 14.2083 16.275 13.725C15.7917 13.2417 15.2 13 14.5 13C13.8 13 13.2083 13.2417 12.725 13.725C12.2417 14.2083 12 14.8 12 15.5C12 16.2 12.2417 16.7917 12.725 17.275C13.2083 17.7583 13.8 18 14.5 18ZM2 17.5H6V13.5H2V17.5Z" fill="currentColor"/></svg>
                }
                @case ('khachhang') {
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM18 16V13C18 12.2667 17.7958 11.5625 17.3875 10.8875C16.9792 10.2125 16.4 9.63333 15.65 9.15C16.5 9.25 17.3 9.42083 18.05 9.6625C18.8 9.90417 19.5 10.2 20.15 10.55C20.75 10.8833 21.2083 11.2542 21.525 11.6625C21.8417 12.0708 22 12.5167 22 13V16H18ZM8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM18 4C18 5.1 17.6083 6.04167 16.825 6.825C16.0417 7.60833 15.1 8 14 8C13.8167 8 13.5833 7.97917 13.3 7.9375C13.0167 7.89583 12.7833 7.85 12.6 7.8C13.05 7.26667 13.3958 6.675 13.6375 6.025C13.8792 5.375 14 4.7 14 4C14 3.3 13.8792 2.625 13.6375 1.975C13.3958 1.325 13.05 0.733333 12.6 0.2C12.8333 0.116667 13.0667 0.0625 13.3 0.0375C13.5333 0.0125 13.7667 0 14 0C15.1 0 16.0417 0.391667 16.825 1.175C17.6083 1.95833 18 2.9 18 4ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z" fill="currentColor"/></svg>
                }
                @case ('baocao') {
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 14H6V7H4V14ZM8 14H10V4H8V14ZM12 14H14V10H12V14ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18H2ZM2 16H16V2H2V16Z" fill="currentColor"/></svg>
                }
                @case ('blog') {
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 14H11V12H4V14ZM4 10H14V8H4V10ZM4 6H14V4H4V6ZM2 18C1.45 18 0.979167 17.8042 0.5875 17.4125C0.195833 17.0208 0 16.55 0 16V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V16C18 16.55 17.8042 17.0208 17.4125 17.4125C17.0208 17.8042 16.55 18 16 18H2ZM2 16H16V2H2V16Z" fill="currentColor"/></svg>
                }
                @case ('voucher') {
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 13C10.2833 13 10.5208 12.9042 10.7125 12.7125C10.9042 12.5208 11 12.2833 11 12C11 11.7167 10.9042 11.4792 10.7125 11.2875C10.5208 11.0958 10.2833 11 10 11C9.71667 11 9.47917 11.0958 9.2875 11.2875C9.09583 11.4792 9 11.7167 9 12C9 12.2833 9.09583 12.5208 9.2875 12.7125C9.47917 12.9042 9.71667 13 10 13ZM10 9C10.2833 9 10.5208 8.90417 10.7125 8.7125C10.9042 8.52083 11 8.28333 11 8C11 7.71667 10.9042 7.47917 10.7125 7.2875C10.5208 7.09583 10.2833 7 10 7C9.71667 7 9.47917 7.09583 9.2875 7.2875C9.09583 7.47917 9 7.71667 9 8C9 8.28333 9.09583 8.52083 9.2875 8.7125C9.47917 8.90417 9.71667 9 10 9ZM10 5C10.2833 5 10.5208 4.90417 10.7125 4.7125C10.9042 4.52083 11 4.28333 11 4C11 3.71667 10.9042 3.47917 10.7125 3.2875C10.5208 3.09583 10.2833 3 10 3C9.71667 3 9.47917 3.09583 9.2875 3.2875C9.09583 3.47917 9 3.71667 9 4C9 4.28333 9.09583 4.52083 9.2875 4.7125C9.47917 4.90417 9.71667 5 10 5ZM18 16H2C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V10C0.55 10 1.02083 9.80417 1.4125 9.4125C1.80417 9.02083 2 8.55 2 8C2 7.45 1.80417 6.97917 1.4125 6.5875C1.02083 6.19583 0.55 6 0 6V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V6C19.45 6 18.9792 6.19583 18.5875 6.5875C18.1958 6.97917 18 7.45 18 8C18 8.55 18.1958 9.02083 18.5875 9.4125C18.9792 9.80417 19.45 10 20 10V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16Z" fill="currentColor"/></svg>
                }
                @case ('tichdiem') {
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 16L10 12.95L14 16L12.5 11.05L16.5 8.2H11.6L10 3L8.4 8.2H3.5L7.5 11.05L6 16ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="currentColor"/></svg>
                }
                @default {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                }
              }
            </span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Admin profile at bottom of sidebar -->
      @if (authService.currentUser$ | async; as user) {
        <div class="sidebar__footer">
          <div class="sidebar__profile-wrapper" [class.sidebar__profile-wrapper--open]="isOpen()">
            <!-- Dropdown popup -->
            @if (isOpen()) {
              <div class="profile-dropdown">
                <div class="profile-dropdown__header">
                  <div class="profile-dropdown__name">{{ user.fullName || 'Admin WeBee' }}</div>
                  <div class="profile-dropdown__email">{{ user.email || 'admin&#64;gmail.com' }}</div>
                </div>

                <div class="profile-dropdown__divider"></div>

                <a class="profile-dropdown__item" routerLink="/admin" (click)="isOpen.set(false)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>Hồ sơ cá nhân</span>
                </a>

                <a class="profile-dropdown__item" routerLink="/admin" (click)="isOpen.set(false)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  <span>Cài đặt hệ thống</span>
                </a>

                <div class="profile-dropdown__divider"></div>

                <button class="profile-dropdown__item profile-dropdown__item--logout" (click)="logout()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            }

            <!-- Trigger button -->
            <button class="sidebar__profile" (click)="toggleDropdown($event)" type="button">
              <div class="sidebar__avatar">{{ getInitials(user.fullName || user.email || 'Admin') }}</div>
              <div class="sidebar__profile-meta">
                <strong>{{ user.fullName || 'Admin WeBee' }}</strong>
                <span>{{ user.role === 'admin' ? 'Quản trị viên' : 'Thành viên' }}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="sidebar__chevron" [class.sidebar__chevron--up]="isOpen()"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      position: sticky;
      top: 0;
      background: #ffffff;
      color: #2b1a0f;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #ede8e2;
      font-family: "Be Vietnam Pro", sans-serif;
    }
    .sidebar__brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border-bottom: 1px solid #ede8e2;
    }
    .sidebar__logo { height: 38px; object-fit: contain; }
    .sidebar__eyebrow {
      margin: 0 0 2px;
      font-size: 10px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: #c96a2e;
      font-weight: 700;
    }
    .sidebar__brand-name {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      color: #2b1a0f;
      font-family: "Fraunces", serif;
    }
    .sidebar__nav {
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      overflow-y: auto;
    }
    .sidebar__link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      color: #807663;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .sidebar__link:hover {
      background: #fff5ee;
      color: #2b1a0f;
    }
    .sidebar__link--active {
      background: #f5c842 !important;
      color: #2b1a0f !important;
      font-weight: 700 !important;
    }
    .sidebar__icon {
      width: 20px;
      height: 20px;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Footer profile area */
    .sidebar__footer {
      border-top: 1px solid #ede8e2;
      padding: 10px;
      position: relative;
    }
    .sidebar__profile-wrapper { position: relative; }
    .sidebar__profile {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 10px;
      text-align: left;
      transition: background 0.2s;
    }
    .sidebar__profile:hover { background: #fff5ee; }
    .sidebar__avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f5c842, #c96a2e);
      color: #fff;
      font-weight: 800;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sidebar__profile-meta {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .sidebar__profile-meta strong {
      font-size: 13px;
      color: #2b1a0f;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sidebar__profile-meta span { font-size: 11px; color: #7a6555; }
    .sidebar__chevron {
      color: #7a6555;
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .sidebar__chevron--up { transform: rotate(180deg); }

    /* Profile dropdown */
    .profile-dropdown {
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      margin-bottom: 4px;
      background: #ffffff;
      border: 1px solid #ede8e2;
      border-radius: 14px;
      box-shadow: 0 -8px 24px rgba(43, 26, 15, 0.10);
      z-index: 1000;
      padding: 6px 0;
      animation: slideUp 0.15s ease-out;
    }
    .profile-dropdown__header { padding: 12px 16px; }
    .profile-dropdown__name {
      font-weight: 700;
      color: #2b1a0f;
      font-size: 13.5px;
    }
    .profile-dropdown__email { font-size: 11.5px; color: #7a6555; margin-top: 2px; }
    .profile-dropdown__divider { height: 1px; background: #ede8e2; margin: 4px 0; }
    .profile-dropdown__item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      border: none;
      background: none;
      padding: 9px 16px;
      color: #2b1a0f;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      cursor: pointer;
      text-align: left;
      box-sizing: border-box;
      transition: background 0.15s;
      font-family: "Be Vietnam Pro", sans-serif;
    }
    .profile-dropdown__item:hover {
      background: #fdfbf5;
      color: #c96a2e;
    }
    .profile-dropdown__item--logout { color: #dc2626; }
    .profile-dropdown__item--logout:hover {
      background: #fef2f2;
      color: #dc2626;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 900px) {
      .sidebar {
        width: 100%;
        height: auto;
        position: static;
        border-right: none;
        border-bottom: 1px solid #ede8e2;
      }
      .sidebar__nav { flex-direction: row; flex-wrap: wrap; }
      .sidebar__link { flex: 1 1 130px; }
      .sidebar__footer { display: none; }
    }
  `],
})
export class AdminSidebarComponent {
  readonly authService = inject(AuthService);
  readonly isOpen = signal(false);

  readonly items: SidebarItem[] = [
    { label: 'Tổng quan', path: '/admin', icon: 'tongquan' },
    { label: 'Đơn hàng', path: '/admin/orders', icon: 'donhang' },
    { label: 'Sản phẩm', path: '/admin/products', icon: 'sanpham' },
    { label: 'Danh mục', path: '/admin/categories', icon: 'danhmuc' },
    { label: 'Khách hàng', path: '/admin/customers', icon: 'khachhang' },
    { label: 'Báo cáo', path: '/admin/reports', icon: 'baocao' },
    { label: 'Quản lý Blog', path: '/admin/blog', icon: 'blog' },
    { label: 'Voucher', path: '/admin/vouchers', icon: 'voucher' },
    { label: 'Tích điểm', path: '/admin/member-points', icon: 'tichdiem' },
  ];

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.isOpen.set(false);
  }

  logout(): void {
    this.isOpen.set(false);
    this.authService.logout();
  }

  getInitials(value: string | null | undefined): string {
    const normalized = value ?? 'Admin';
    return normalized
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'A';
  }
}
