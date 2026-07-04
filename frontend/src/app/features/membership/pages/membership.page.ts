import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-membership-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="content-page">
      <div class="content-page__inner" style="padding:48px 0">
        <h1 class="content-page__title">Chương trình Thành viên WeBee</h1>
        <p class="membership-intro">Tích điểm mỗi đơn hàng, nhận ưu đãi độc quyền và nâng hạng thành viên!</p>

        <div class="tier-grid">
          @for (tier of tiers; track tier.name) {
            <div class="tier-card" [style.borderColor]="tier.color">
              <div class="tier-card__header" [style.color]="tier.color">
                {{ tier.name }}
              </div>
              <div class="tier-card__body">
                <p class="tier-card__desc">{{ tier.description }}</p>
                <ul class="tier-card__benefits">
                  @for (b of tier.benefits; track b) {
                    <li>✓ {{ b }}</li>
                  }
                </ul>
              </div>
            </div>
          }
        </div>

        <div class="membership-cta">
          <h2>Bắt đầu ngay hôm nay!</h2>
          <p>Đăng ký tài khoản và mua hàng để tích điểm thưởng.</p>
          <div class="membership-cta__btns">
            <a class="btn btn--primary" routerLink="/register">Đăng ký</a>
            <a class="btn btn--outline" routerLink="/products">Xem sản phẩm</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;
    .membership-intro { font-size: t.$fs-body; color: t.$muted; margin-bottom: t.$sp-6; max-width: 60ch; }
    .tier-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: t.$sp-4; margin-bottom: t.$sp-7; align-items: start; }
    .tier-card { border: 1px solid t.$border; border-top: 3px solid; background: t.$surface; }
    .tier-card__header {
      font-family: t.$font-display; font-style: italic;
      padding: t.$sp-4 t.$sp-4 0; font-size: 1.25rem; font-weight: 550;
    }
    .tier-card__body { padding: t.$sp-3 t.$sp-4 t.$sp-4; }
    .tier-card__desc { font-size: t.$fs-micro; color: t.$muted; margin: 0 0 t.$sp-3; padding-bottom: t.$sp-3; border-bottom: 1px solid t.$border; }
    .tier-card__benefits { margin: 0; padding-left: 0; list-style: none; }
    .tier-card__benefits li { font-size: t.$fs-micro; padding: 4px 0; color: t.$ink; }
    .membership-cta { text-align: center; padding: t.$sp-7 0 t.$sp-4; border-top: 1px solid t.$border; }
    .membership-cta h2 { font-family: t.$font-display; font-style: italic; font-size: t.$fs-h3; font-weight: 550; color: t.$ink; margin: 0 0 t.$sp-2; }
    .membership-cta p { color: t.$muted; margin: 0 0 t.$sp-5; }
    .membership-cta__btns { display: flex; gap: t.$sp-5; justify-content: center; align-items: center; flex-wrap: wrap; }
    .btn--primary { @include m.btn-solid; }
    .btn--outline { @include m.btn-text; }
  `],
  styleUrl: '../../blog/pages/content.page.scss',
})
export class MembershipPage {
  readonly tiers = [
    {
      name: 'Member', icon: '🥉', color: '#6b6b6b',
      description: 'Tham gia miễn phí khi đăng ký',
      benefits: ['1 điểm / 10.000₫', 'Nhận thông báo ưu đãi'],
    },
    {
      name: 'Bronze', icon: '🥈', color: '#cd7f32',
      description: '3+ đơn hoặc 500K+ trong 6 tháng',
      benefits: ['1.2x điểm tích lũy', 'Ưu đãi sinh nhật', '5% giảm giá'],
    },
    {
      name: 'Silver', icon: '⭐', color: '#a8a9ad',
      description: '6+ đơn hoặc 1.5M+ trong 6 tháng',
      benefits: ['1.5x điểm tích lũy', '8% giảm giá', 'Hỗ trợ ưu tiên'],
    },
    {
      name: 'Gold', icon: '🌟', color: '#e8b86d',
      description: '12+ đơn hoặc 3M+ trong 6 tháng',
      benefits: ['2x điểm tích lũy', '12% giảm giá', 'Giao hàng miễn phí'],
    },
    {
      name: 'Diamond', icon: '💎', color: '#5b9bd5',
      description: '20+ đơn hoặc 6M+ trong 6 tháng',
      benefits: ['3x điểm tích lũy', '15% giảm giá', 'VIP support 24/7'],
    },
  ];
}
