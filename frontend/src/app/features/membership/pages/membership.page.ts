import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface TierChip {
  icon: 'spark' | 'ticket' | 'clock' | 'shield';
  top: string;
  sub: string;
}

interface TierView {
  key: string;
  name: string;
  top?: boolean;
  icon: 'tag' | 'medal' | 'diamond';
  medal: { main: string; inner: string; ribbonL: string; ribbonR: string };
  condition: string;
  chips: TierChip[];
  desc: string;
}

@Component({
  selector: 'app-membership-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="content-page">
      <div class="content-page__inner mb">

        <!-- Hero -->
        <header class="mb-hero">
          <span class="mb-hero__badge">
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path d="M4.1 16.2 2.9 7.6l4.9 3.5L12 4.8l4.2 6.3 4.9-3.5-1.2 8.6z" fill="#c47a2b"/>
              <rect x="4.1" y="17.6" width="15.8" height="2.4" rx="1" fill="#c47a2b"/>
              <circle cx="12" cy="11.6" r="1.4" fill="#f5c842"/>
            </svg>
          </span>
          <h1 class="mb-hero__title">Chương trình thành viên</h1>
          <p class="mb-hero__sub">
            Hạng được xét dựa trên doanh thu &amp; số đơn hàng trong kỳ đánh giá 6 tháng —
            hạng càng cao, hệ số tích điểm càng lớn
          </p>
          @if (loggedIn) {
            <a class="mb-hero__cta" routerLink="/account">Xem hạng của bạn <span aria-hidden="true">→</span></a>
          } @else {
            <a class="mb-hero__cta" routerLink="/auth/login">Đăng nhập để xem hạng của bạn <span aria-hidden="true">→</span></a>
          }
        </header>

        <!-- How it works -->
        <section class="mb-section">
          <h2 class="mb-section__title">Cách hoạt động</h2>
          <div class="mb-steps">
            @for (step of steps; track step.title; let i = $index) {
              <article class="mb-step">
                <div class="mb-step__icon">
                  @switch (step.icon) {
                    @case ('bag') {
                      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
                        <path d="M5.5 8.5h13L17.4 20H6.6z"/>
                        <path d="M9 8.5V6.8a3 3 0 0 1 6 0v1.7" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('star') {
                      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
                        <path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.8l5-.7z"/>
                      </svg>
                    }
                    @case ('gift') {
                      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
                        <rect x="4.5" y="8.5" width="15" height="4" rx="0.8"/>
                        <path d="M6 12.5h12V20H6zM12 8.5V20"/>
                        <path d="M12 8.5c-1.8 0-3.8-.6-3.8-2.2 0-1.2 1-1.8 1.9-1.8 1.4 0 1.9 1.6 1.9 4zm0 0c1.8 0 3.8-.6 3.8-2.2 0-1.2-1-1.8-1.9-1.8-1.4 0-1.9 1.6-1.9 4z"/>
                      </svg>
                    }
                  }
                  <span class="mb-step__num">{{ i + 1 }}</span>
                </div>
                <h3 class="mb-step__title">{{ step.title }}</h3>
                <p class="mb-step__desc">{{ step.desc }}</p>
              </article>
            }
          </div>
        </section>

        <!-- Tier benefits -->
        <section class="mb-section">
          <h2 class="mb-section__title">Quyền lợi theo hạng</h2>
          <div class="mb-tiers">
            @for (tier of tiers; track tier.key) {
              <article class="mb-tier" [class.mb-tier--top]="tier.top">
                <header class="mb-tier__head">
                  <span class="mb-tier__medal">
                    @switch (tier.icon) {
                      @case ('tag') {
                        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
                          <path d="M3 4.6A1.6 1.6 0 0 1 4.6 3h6.6c.42 0 .83.17 1.13.47l8.2 8.2a1.6 1.6 0 0 1 0 2.26l-6.6 6.6a1.6 1.6 0 0 1-2.26 0l-8.2-8.2A1.6 1.6 0 0 1 3 11.2z" [attr.fill]="tier.medal.main"/>
                          <path d="M4.6 3h6.6c.42 0 .83.17 1.13.47l4.1 4.1L6.1 17.9l-2.63-2.63A1.6 1.6 0 0 1 3 14.14V4.6A1.6 1.6 0 0 1 4.6 3z" [attr.fill]="tier.medal.inner" opacity="0.55"/>
                          <circle cx="7.6" cy="7.6" r="1.7" fill="#fffbf7"/>
                        </svg>
                      }
                      @case ('medal') {
                        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
                          <path d="M8.6 1.8 6 8.4h4.2L12.4 2z" [attr.fill]="tier.medal.ribbonL"/>
                          <path d="M15.4 1.8 18 8.4h-4.2L11.6 2z" [attr.fill]="tier.medal.ribbonR"/>
                          <circle cx="12" cy="15" r="6.6" [attr.fill]="tier.medal.main"/>
                          <circle cx="12" cy="15" r="4.9" [attr.fill]="tier.medal.inner"/>
                          <path d="m12 12.1.9 1.9 2.1.3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.4 2.1-.3z" [attr.fill]="tier.medal.main"/>
                        </svg>
                      }
                      @case ('diamond') {
                        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
                          <path d="M6.2 3.5h11.6L21.4 9 12 20.5 2.6 9z" [attr.fill]="tier.medal.main"/>
                          <path d="M2.6 9h18.8M12 20.5 8.3 9l3.7-5.5L15.7 9z" fill="none" stroke="#fffbf7" stroke-width="1" opacity="0.65" stroke-linejoin="round"/>
                        </svg>
                      }
                    }
                  </span>
                  <div class="mb-tier__id">
                    <h3 class="mb-tier__name">
                      {{ tier.name }}
                      @if (tier.top) { <span class="mb-tier__flag">Cao nhất</span> }
                    </h3>
                    <p class="mb-tier__cond">{{ tier.condition }}</p>
                  </div>
                </header>

                <div class="mb-tier__chips">
                  @for (chip of tier.chips; track chip.sub) {
                    <div class="mb-chip">
                      <span class="mb-chip__icon">
                        @switch (chip.icon) {
                          @case ('spark') {
                            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="currentColor">
                              <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4zM18.5 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>
                            </svg>
                          }
                          @case ('ticket') {
                            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7">
                              <path d="M3 9.2V7.5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v1.7a2.4 2.4 0 0 0 0 5.6v1.7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1.7a2.4 2.4 0 0 0 0-5.6z" stroke-linejoin="round"/>
                              <path d="M14.5 6.5v11" stroke-dasharray="2.4 2.2"/>
                            </svg>
                          }
                          @case ('clock') {
                            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
                              <circle cx="12" cy="12" r="8"/>
                              <path d="M12 7.5V12l3 2"/>
                            </svg>
                          }
                          @case ('shield') {
                            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
                              <path d="M12 3l7 2.7v5.5c0 4.5-2.9 7.7-7 9.8-4.1-2.1-7-5.3-7-9.8V5.7z"/>
                              <path d="m9 11.8 2.1 2.1 3.9-4" stroke-linecap="round"/>
                            </svg>
                          }
                        }
                      </span>
                      <span class="mb-chip__text">
                        <strong>{{ chip.top }}</strong>
                        <small>{{ chip.sub }}</small>
                      </span>
                    </div>
                  }
                </div>

                <p class="mb-tier__desc">{{ tier.desc }}</p>
              </article>
            }
          </div>
        </section>

        <!-- Point formula -->
        <aside class="mb-formula">
          <span class="mb-formula__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
              <path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.8l5-.7z"/>
            </svg>
          </span>
          <div class="mb-formula__body">
            <strong>Cách tính điểm</strong>
            <p>Mỗi 10.000₫ = 1 điểm × hệ số theo hạng thành viên</p>
          </div>
        </aside>

        <div class="membership-cta">
          <h2>Bắt đầu ngay hôm nay!</h2>
          <p>Đăng ký tài khoản và mua hàng để tích điểm thưởng.</p>
          <div class="membership-cta__btns">
            <a class="btn btn--primary" routerLink="/auth/register">Đăng ký</a>
            <a class="btn btn--outline" routerLink="/products">Xem sản phẩm</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use "tokens" as t;
    @use "mixins" as m;

    .mb { padding: t.$sp-6 0 0; }

    /* --- Hero ------------------------------------------------------------ */
    .mb-hero { text-align: center; max-width: 640px; margin: 0 auto t.$sp-8; }
    .mb-hero__badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: 50%;
      background: t.$sand; margin-bottom: t.$sp-4;
    }
    .mb-hero__title {
      font-family: t.$font-display; font-style: italic; font-weight: 550;
      font-size: t.$fs-display-2; color: t.$ink; margin: 0 0 t.$sp-3; line-height: 1.1;
    }
    .mb-hero__sub { font-size: t.$fs-body; color: t.$muted; line-height: 1.65; margin: 0 0 t.$sp-5; }
    .mb-hero__cta {
      @include m.btn-solid;
      span { transition: transform 0.2s ease; display: inline-block; }
      &:hover span { transform: translateX(3px); }
    }

    /* --- Sections ---------------------------------------------------------- */
    .mb-section { margin-bottom: t.$sp-8; }
    .mb-section__title {
      font-family: t.$font-display; font-style: italic; font-weight: 550;
      font-size: t.$fs-h3; color: t.$ink; text-align: center; margin: 0 0 t.$sp-6;
    }

    /* --- How it works ------------------------------------------------------ */
    .mb-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: t.$sp-5; }
    @include m.mq-down(md) { .mb-steps { grid-template-columns: 1fr; } }
    .mb-step {
      background: t.$surface; border: 1px solid t.$border; border-radius: t.$r-sm;
      padding: t.$sp-6 t.$sp-5; text-align: center;
    }
    .mb-step__icon {
      position: relative; display: inline-flex; align-items: center; justify-content: center;
      width: 52px; height: 52px; border-radius: 50%;
      background: t.$surface-warm; color: t.$caramel; margin-bottom: t.$sp-4;
    }
    .mb-step__num {
      position: absolute; top: -4px; right: -6px;
      width: 20px; height: 20px; border-radius: 50%;
      background: t.$primary; color: #fff;
      font-size: 0.6875rem; font-weight: 700; line-height: 20px; text-align: center;
    }
    .mb-step__title { font-size: t.$fs-body; font-weight: 700; color: t.$ink; margin: 0 0 t.$sp-2; }
    .mb-step__desc { font-size: t.$fs-body-sm; color: t.$muted; line-height: 1.65; margin: 0; }

    /* --- Tier cards ---------------------------------------------------------- */
    .mb-tiers {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: t.$sp-5; align-items: start;
    }
    .mb-tier {
      background: t.$surface; border: 1px solid t.$border; border-radius: t.$r-sm;
      padding: t.$sp-5;
    }
    .mb-tier--top { border: 1.5px solid t.$caramel; box-shadow: t.$shadow-soft; }
    .mb-tier__head { display: flex; align-items: flex-start; gap: t.$sp-3; margin-bottom: t.$sp-4; }
    .mb-tier__medal { flex-shrink: 0; display: inline-flex; margin-top: 2px; }
    .mb-tier__name {
      display: flex; align-items: center; gap: t.$sp-2;
      font-size: 1.125rem; font-weight: 800; letter-spacing: 0.04em;
      text-transform: uppercase; color: t.$ink; margin: 0 0 2px;
    }
    .mb-tier__flag {
      font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.02em; text-transform: none;
      background: t.$sand; color: t.$primary-dark;
      border-radius: t.$r-pill; padding: 2px 10px;
    }
    .mb-tier__cond { font-size: t.$fs-micro; color: t.$muted; margin: 0; }
    .mb-tier__chips {
      display: grid; grid-template-columns: 1fr 1fr; gap: t.$sp-2;
      margin-bottom: t.$sp-4;
    }
    .mb-chip {
      display: flex; align-items: center; gap: t.$sp-2;
      border: 1px solid t.$border; border-radius: 8px;
      padding: t.$sp-2 t.$sp-3; background: t.$paper;
    }
    .mb-chip__icon {
      flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%;
      background: t.$surface-warm; color: t.$caramel;
    }
    .mb-chip__text { display: flex; flex-direction: column; min-width: 0; }
    .mb-chip__text strong { font-size: t.$fs-micro; font-weight: 700; color: t.$ink; line-height: 1.3; }
    .mb-chip__text small { font-size: 0.6875rem; color: t.$muted; line-height: 1.3; }
    .mb-tier__desc {
      background: t.$surface-warm; border-radius: 8px;
      padding: t.$sp-3 t.$sp-4; margin: 0;
      font-size: t.$fs-micro; color: t.$muted; line-height: 1.7;
    }

    /* --- Point formula band ---------------------------------------------------- */
    .mb-formula {
      display: flex; align-items: center; justify-content: center; gap: t.$sp-4;
      background: t.$sand; border-radius: t.$r-sm;
      padding: t.$sp-6 t.$sp-5; text-align: left;
    }
    .mb-formula__icon {
      flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
      width: 44px; height: 44px; border-radius: 50%;
      background: t.$surface; color: t.$caramel;
    }
    .mb-formula__body strong { display: block; font-size: t.$fs-body; color: t.$ink; margin-bottom: 2px; }
    .mb-formula__body p { margin: 0; font-size: t.$fs-body-sm; color: t.$muted; }

    /* --- Legacy CTA (unchanged) ------------------------------------------------ */
    .membership-cta { text-align: center; padding: t.$sp-7 0 t.$sp-4; border-top: 1px solid t.$border; margin-top: t.$sp-7; }
    .membership-cta h2 { font-family: t.$font-display; font-style: italic; font-size: t.$fs-h3; font-weight: 550; color: t.$ink; margin: 0 0 t.$sp-2; }
    .membership-cta p { color: t.$muted; margin: 0 0 t.$sp-5; }
    .membership-cta__btns { display: flex; gap: t.$sp-5; justify-content: center; align-items: center; flex-wrap: wrap; }
    .btn--primary { @include m.btn-solid; }
    .btn--outline { @include m.btn-text; }
  `],
  styleUrl: '../../blog/pages/content.page.scss',
})
export class MembershipPage {
  private readonly auth = inject(AuthService);

  get loggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  readonly steps = [
    {
      icon: 'bag' as const,
      title: 'Mua = Tích điểm',
      desc: '10.000₫ = 1 điểm. Nâng hạng cao được nâng hệ số nhân khi tích điểm.',
    },
    {
      icon: 'star' as const,
      title: 'Điểm = Quà',
      desc: 'Dùng điểm để đổi voucher quà tặng, hệ thống luôn sẵn kho voucher quà mỗi tháng.',
    },
    {
      icon: 'gift' as const,
      title: 'Tự nâng hạng',
      desc: 'Đạt mức chi tiêu & số đơn trong kỳ, hệ thống tự động nâng hạng cao hơn.',
    },
  ];

  readonly tiers: TierView[] = [
    {
      key: 'member',
      name: 'Member',
      icon: 'tag',
      medal: { main: '#f5c842', inner: '#fde28a', ribbonL: '', ribbonR: '' },
      condition: 'Tất cả khách hàng đăng ký',
      chips: [
        { icon: 'spark', top: '×1', sub: 'tích điểm' },
        { icon: 'ticket', top: 'Đổi điểm', sub: 'lấy voucher' },
        { icon: 'clock', top: '6 tháng', sub: 'kỳ xét hạng' },
        { icon: 'shield', top: 'Ưu đãi', sub: 'thành viên' },
      ],
      desc: 'Hạng mặc định cho mọi khách hàng đăng ký tài khoản. Tích 1 điểm cho mỗi 10.000₫, dùng điểm đổi voucher và nhận thông báo ưu đãi sớm từ WeBee.',
    },
    {
      key: 'bronze',
      name: 'Bronze',
      icon: 'medal',
      medal: { main: '#cd7f32', inner: '#e3a86b', ribbonL: '#c0503f', ribbonR: '#e0705c' },
      condition: 'Chi tiêu từ 500.000 ₫ · Từ 2 đơn',
      chips: [
        { icon: 'spark', top: '×1', sub: 'tích điểm' },
        { icon: 'ticket', top: '1 voucher', sub: 'mỗi tháng' },
        { icon: 'clock', top: '6 tháng', sub: 'kỳ xét hạng' },
        { icon: 'shield', top: 'Ưu đãi', sub: 'đặc quyền' },
      ],
      desc: 'Hạng Đồng: tích lũy từ 2 đơn và doanh thu từ 500.000₫ trong kỳ. Mỗi tháng nhận 1 voucher quà tặng, kèm ưu đãi sinh nhật và giảm giá đơn hàng.',
    },
    {
      key: 'silver',
      name: 'Silver',
      icon: 'medal',
      medal: { main: '#a8a9ad', inner: '#cdced1', ribbonL: '#4a7fb5', ribbonR: '#6f9fce' },
      condition: 'Chi tiêu từ 1.200.000 ₫ · Từ 4 đơn',
      chips: [
        { icon: 'spark', top: '×1.2', sub: 'tích điểm' },
        { icon: 'ticket', top: '2 voucher', sub: 'mỗi tháng' },
        { icon: 'clock', top: '6 tháng', sub: 'kỳ xét hạng' },
        { icon: 'shield', top: 'Ưu đãi', sub: 'đặc quyền' },
      ],
      desc: 'Hạng Bạc: từ 4 đơn và doanh thu từ 1.200.000₫ trong kỳ. Hệ số tích điểm ×1.2, mỗi tháng nhận 2 voucher ưu đãi và được hỗ trợ ưu tiên.',
    },
    {
      key: 'gold',
      name: 'Gold',
      icon: 'medal',
      medal: { main: '#e2a93b', inner: '#f0cd7a', ribbonL: '#c0503f', ribbonR: '#e0705c' },
      condition: 'Chi tiêu từ 2.500.000 ₫ · Từ 6 đơn',
      chips: [
        { icon: 'spark', top: '×1.5', sub: 'tích điểm' },
        { icon: 'ticket', top: '2 voucher', sub: 'mỗi tháng' },
        { icon: 'clock', top: '6 tháng', sub: 'kỳ xét hạng' },
        { icon: 'shield', top: 'Ưu đãi', sub: 'đặc quyền' },
      ],
      desc: 'Hạng Vàng: từ 6 đơn và doanh thu từ 2.500.000₫ trong kỳ. Hệ số tích điểm ×1.5, mỗi tháng nhận 2 voucher giá trị cao, kèm giao hàng miễn phí.',
    },
    {
      key: 'diamond',
      name: 'Diamond',
      top: true,
      icon: 'diamond',
      medal: { main: '#5b9bd5', inner: '#8dbbe4', ribbonL: '', ribbonR: '' },
      condition: 'Chi tiêu từ 5.000.000 ₫ · Từ 10 đơn',
      chips: [
        { icon: 'spark', top: '×2', sub: 'tích điểm' },
        { icon: 'ticket', top: '3 voucher', sub: 'mỗi tháng' },
        { icon: 'clock', top: '6 tháng', sub: 'kỳ xét hạng' },
        { icon: 'shield', top: 'Ưu đãi', sub: 'đặc quyền' },
      ],
      desc: 'Hạng Kim Cương: từ 10 đơn và doanh thu từ 5.000.000₫ trong kỳ. Hệ số tích điểm ×2 — cao nhất hệ thống, mỗi tháng 3 voucher độc quyền và hỗ trợ VIP 24/7.',
    },
  ];
}
