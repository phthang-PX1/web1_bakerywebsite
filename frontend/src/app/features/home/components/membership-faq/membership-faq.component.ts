import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { HomeFaqItem } from '../../home.models';

@Component({
  selector: 'app-membership-faq',
  imports: [RouterLink],
  templateUrl: './membership-faq.component.html',
  styleUrl: './membership-faq.component.scss'
})
export class MembershipFaqComponent {
  readonly faqs = input.required<readonly HomeFaqItem[]>();
  protected readonly openId = signal<string | null>('join');

  protected toggle(id: string): void {
    this.openId.update((currentId) => (currentId === id ? null : id));
  }
}
