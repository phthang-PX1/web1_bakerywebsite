import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { AdminSidebarComponent } from '../components/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, ToastComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar />
      <div class="admin-layout__content">
        <main class="admin-layout__main">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-toast />
  `,
  styles: [`
    .admin-layout {
      min-height: 100dvh;
      display: flex;
      background: #fdfbf5; /* WeBee Paper warm cream color */
      font-family: "Be Vietnam Pro", sans-serif;
    }
    .admin-layout__content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .admin-layout__main {
      flex: 1;
      overflow-y: auto;
    }
    @media (max-width: 900px) {
      .admin-layout { flex-direction: column; }
    }
  `],
})
export class AdminLayoutComponent {}

