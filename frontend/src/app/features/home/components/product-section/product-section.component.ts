import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ProductCardComponent,
  type ProductCardViewModel
} from '../../../../shared/components/product-card/product-card.component';


@Component({
  selector: 'app-product-section',
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './product-section.component.html',
  styleUrl: './product-section.component.scss'
})
export class ProductSectionComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly products = input.required<readonly ProductCardViewModel[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly softBackground = input(false);
  readonly compactCards = input(false);
}
