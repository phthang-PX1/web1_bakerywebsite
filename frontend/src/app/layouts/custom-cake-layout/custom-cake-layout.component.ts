import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-custom-cake-layout',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, ToastComponent],
  template: `
    <div class="custom-cake-layout">
      <app-site-header />
      <main class="custom-cake-layout__main">
        <router-outlet />
      </main>
    </div>
    <app-toast />
  `,
  styles: [`
    .custom-cake-layout {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      overflow: hidden;
    }

    .custom-cake-layout__main {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
  `],
})
export class CustomCakeLayoutComponent {}
