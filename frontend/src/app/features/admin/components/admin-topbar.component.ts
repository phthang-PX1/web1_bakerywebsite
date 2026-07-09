import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [],
  template: `
    <header class="topbar">
      <div>
        <p class="topbar__eyebrow">Quản trị hệ thống</p>
        <h1 class="topbar__title">Bảng điều khiển WeBee</h1>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px;
      border-bottom: 1px solid #ede8e2;
      background: #fffbf7;
      gap: 16px;
      font-family: "Be Vietnam Pro", sans-serif;
    }
    .topbar__eyebrow {
      margin: 0 0 2px;
      color: #c96a2e;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.24em;
      text-transform: uppercase;
    }
    .topbar__title {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #2b1a0f;
      font-family: "Fraunces", serif;
    }
    @media (max-width: 700px) {
      .topbar { padding: 16px; }
    }
  `],
})
export class AdminTopbarComponent {}
