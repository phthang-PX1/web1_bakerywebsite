import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent, ToastComponent],
  template: `
    <app-site-header />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-site-footer />
    <app-toast />
  `,
  styles: [`
    .main-content { min-height: calc(100dvh - 72px); }
  `],
})
export class MainLayoutComponent {}
