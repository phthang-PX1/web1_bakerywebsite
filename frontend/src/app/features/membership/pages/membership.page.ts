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
              <div class="tier-card__header" [style.background]="tier.color + '22'" [style.color]="tier.color">
                {{ tier.icon }} {{ tier.name }}
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
    .membership-intro { font-size: 18px; color: #6b6b6b; margin-bottom: 40px; }
    .tier-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-bottom: 48px; }
    .tier-card { border: 2px solid; border-radius: 12px; overflow: hidden; }
    .tier-card__header { padding: 16px; font-size: 18px; font-weight: 700; text-align: center; }
    .tier-card__body { padding: 16px; }
    .tier-card__desc { font-size: 13px; color: #6b6b6b; margin: 0 0 12px; }
    .tier-card__benefits { margin: 0; padding-left: 0; list-style: none; }
    .tier-card__benefits li { font-size: 13px; padding: 4px 0; color: #374151; }
    .membership-cta { background: #fff; border-radius: 16px; padding: 40px; text-align: center; border: 1px solid #f3f4f6; }
    .membership-cta h2 { font-size: 24px; font-weight: 800; margin: 0 0 8px; }
    .membership-cta p { color: #6b6b6b; margin: 0 0 24px; }
    .membership-cta__btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; border: 2px solid transparent; }
    .btn--primary { background: #C96A2E; color: #fff; }
    .btn--primary:hover { background: #7A3D18; }
    .btn--outline { background: transparent; border-color: #C96A2E; color: #C96A2E; }
    .btn--outline:hover { background: #FFF5EE; }
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
