import { Component, computed, input } from '@angular/core';
import type { MembershipTier } from '../../../core/models/user.model';

const TIER_CONFIG: Record<MembershipTier, { label: string; color: string }> = {
  member:  { label: 'Member',  color: '#6b6b6b' },
  bronze:  { label: 'Bronze',  color: '#cd7f32' },
  silver:  { label: 'Silver',  color: '#a8a9ad' },
  gold:    { label: 'Gold',    color: '#e8b86d' },
  diamond: { label: 'Diamond', color: '#5b9bd5' },
};

@Component({
  selector: 'app-tier-badge',
  standalone: true,
  template: `
    <span class="tier-badge" [style.background]="cfg().color + '22'" [style.color]="cfg().color" [style.borderColor]="cfg().color">
      {{ cfg().label }}
    </span>
  `,
  styles: [`
    .tier-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      border: 1px solid;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  `],
})
export class TierBadgeComponent {
  readonly tier = input.required<MembershipTier>();
  readonly cfg = computed(() => TIER_CONFIG[this.tier()]);
}
