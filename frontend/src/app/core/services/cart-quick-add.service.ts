import { inject, Injectable } from '@angular/core';
import { switchMap, of, Observable } from 'rxjs';

import { OptionsApi } from '../api/options.api';
import { CartService } from './cart.service';
import { ToastService } from './toast.service';
import type { CartResponse } from '../models/cart.model';
import type { ProductCardViewModel } from '../../shared/components/product-card/product-card.component';

@Injectable({ providedIn: 'root' })
export class CartQuickAddService {
  private readonly optionsApi = inject(OptionsApi);
  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  /**
   * Thêm sản phẩm vào giỏ với options mặc định.
   * - Sản phẩm không có required options: gửi option_item_ids = []
   * - Sản phẩm có required options: tự động chọn item đầu tiên của mỗi required group
   */
  add(product: ProductCardViewModel): Observable<CartResponse> {
    if (!product.hasRequiredOptions) {
      return this.cartService.addItem({
        product_id: product.id,
        quantity: 1,
        option_item_ids: [],
      });
    }

    return this.optionsApi.getProductOptions(product.id).pipe(
      switchMap((groups) => {
        const defaultIds = groups
          .filter((g) => g.isRequired && g.items.length > 0)
          .map((g) => g.items[0].itemId);

        return this.cartService.addItem({
          product_id: product.id,
          quantity: 1,
          option_item_ids: defaultIds,
        });
      })
    );
  }

  addWithToast(product: ProductCardViewModel): void {
    this.add(product).subscribe({
      next: () => this.toastService.success(`Đã thêm "${product.name}" vào giỏ hàng.`),
      error: () => this.toastService.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.'),
    });
  }
}
