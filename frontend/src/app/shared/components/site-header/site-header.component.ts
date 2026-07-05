import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, of, Subject, switchMap } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsApi } from '../../../core/api/products.api';
import { CategoriesApi } from '../../../core/api/categories.api';
import type { Product } from '../../../core/models/product.model';
import type { Category } from '../../../core/models/category.model';
import { CurrencyVndPipe } from '../../pipes/currency-vnd.pipe';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [AsyncPipe, CurrencyVndPipe, RouterLink, RouterLinkActive, CartDrawerComponent, FormsModule],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  private readonly cartService = inject(CartService);
  private readonly productsApi = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('searchInput') private searchInputRef!: ElementRef<HTMLInputElement>;

  protected readonly isMenuOpen = signal(false);
  protected readonly isCartOpen = signal(false);
  protected readonly isAccountMenuOpen = signal(false);
  protected readonly suggestionsVisible = signal(false);
  protected readonly isProductsDropdownOpen = signal(false);
  protected readonly isMobileProductsOpen = signal(false);
  protected readonly categories = signal<readonly Category[]>([]);
  protected readonly searchSuggestions = signal<readonly Product[]>([]);
  protected readonly suggestionsLoading = signal(false);
  protected searchQuery = '';
  protected readonly cartQuantity$ = this.cartService.cart$.pipe(map((cart) => cart.totalQuantity));
  private readonly searchInput$ = new Subject<string>();

  /** "Đổi thưởng" dẫn thẳng tới trang đăng nhập khi chưa có phiên; đã đăng nhập thì vào trang đổi thưởng. */
  protected get rewardsLink(): string {
    return this.authService.isLoggedIn() ? '/rewards' : '/auth/login';
  }

  protected get rewardsQueryParams(): { redirect: string } | null {
    return this.authService.isLoggedIn() ? null : { redirect: '/rewards' };
  }

  constructor() {
    this.categoriesApi.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (cats) => this.categories.set(cats) });

    this.searchInput$
      .pipe(
        map((value) => value.trim()),
        debounceTime(280),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 2) {
            this.suggestionsLoading.set(false);
            return of([] as readonly Product[]);
          }

          this.suggestionsLoading.set(true);
          return this.productsApi.getProducts({ search: query, limit: 5, page: 1 }).pipe(
            map((response) => response.items),
            catchError(() => of([] as readonly Product[])),
            finalize(() => this.suggestionsLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((products) => this.searchSuggestions.set(products));
  }

  protected toggleMenu(): void { this.isMenuOpen.update((v) => !v); }
  protected openProductsMenu(): void { this.isProductsDropdownOpen.set(true); }
  protected closeProductsMenu(): void { this.isProductsDropdownOpen.set(false); }
  protected toggleMobileProducts(): void { this.isMobileProductsOpen.update((v) => !v); }
  protected openCart(): void { this.isCartOpen.set(true); }
  protected closeCart(): void { this.isCartOpen.set(false); }
  protected toggleAccountMenu(): void { this.isAccountMenuOpen.update((v) => !v); }
  protected logout(): void { this.authService.logout(); this.isAccountMenuOpen.set(false); }

  protected onSearchFocus(): void {
    this.suggestionsVisible.set(true);
  }

  protected closeSuggestions(): void {
    this.suggestionsVisible.set(false);
  }

  protected onSearchInput(value: string): void {
    this.searchQuery = value;
    this.suggestionsVisible.set(true);
    if (value.trim().length < 2) {
      this.searchSuggestions.set([]);
      this.suggestionsLoading.set(false);
    }
    this.searchInput$.next(value);
  }

  protected submitSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      return;
    }

    this.suggestionsVisible.set(false);
    this.searchInputRef?.nativeElement?.blur();
    this.router.navigate(['/products'], { queryParams: { q } });
  }

  protected selectSuggestion(product: Product): void {
    this.suggestionsVisible.set(false);
    this.searchQuery = '';
    this.searchSuggestions.set([]);
    this.router.navigate(['/products', product.slug]);
  }
}
