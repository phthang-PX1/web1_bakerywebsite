import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, CartDrawerComponent],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  private readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isMenuOpen = signal(false);
  protected readonly isCartOpen = signal(false);
  protected readonly isAccountMenuOpen = signal(false);
  protected readonly cartQuantity$ = this.cartService.cart$.pipe(map((cart) => cart.totalQuantity));

  protected toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  protected openCart(): void {
    this.isCartOpen.set(true);
  }

  protected closeCart(): void {
    this.isCartOpen.set(false);
  }

  protected toggleAccountMenu(): void {
    this.isAccountMenuOpen.update((v) => !v);
  }

  protected logout(): void {
    this.authService.logout();
    this.isAccountMenuOpen.set(false);
  }
}
