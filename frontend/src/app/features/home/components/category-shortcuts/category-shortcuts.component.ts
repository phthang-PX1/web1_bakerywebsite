import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { HomeCategoryItem } from '../../home.models';

@Component({
  selector: 'app-category-shortcuts',
  imports: [RouterLink],
  templateUrl: './category-shortcuts.component.html',
  styleUrl: './category-shortcuts.component.scss'
})
export class CategoryShortcutsComponent {
  readonly categories = input.required<readonly HomeCategoryItem[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
}
