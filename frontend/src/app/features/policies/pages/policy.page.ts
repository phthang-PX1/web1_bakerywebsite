import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface PolicyContent {
  title: string;
  content: string;
}

const POLICIES: Record<string, PolicyContent> = {
  privacy: {
    title: 'Chính sách bảo mật',
    content: `WeBee Bakery cam kết bảo vệ thông tin cá nhân của khách hàng. Chúng tôi thu thập thông tin chỉ với mục đích xử lý đơn hàng và cải thiện trải nghiệm mua sắm.

Thông tin của bạn sẽ không được chia sẻ với bên thứ ba mà không có sự đồng ý của bạn, ngoại trừ các trường hợp cần thiết để hoàn thành đơn hàng (đơn vị vận chuyển, cổng thanh toán).`,
  },
  shipping: {
    title: 'Chính sách vận chuyển',
    content: `WeBee Bakery giao hàng miễn phí trên toàn quốc cho tất cả đơn hàng. Đơn hàng cần đặt trước ít nhất 24 giờ.

Thời gian giao hàng: Từ 08:00–19:00 hàng ngày theo khung giờ bạn chọn lúc đặt.
Đối với bánh tùy chỉnh: Cần đặt trước 48–72 giờ.`,
  },
  returns: {
    title: 'Chính sách đổi trả',
    content: `Vì tính chất của bánh tươi, chúng tôi không nhận đổi trả sau khi giao hàng.

Trong trường hợp bánh bị lỗi hoặc không đúng với đơn đặt, vui lòng liên hệ chúng tôi trong vòng 2 giờ sau khi nhận hàng để được hỗ trợ đổi mới hoặc hoàn tiền.`,
  },
  terms: {
    title: 'Điều khoản sử dụng',
    content: `Khi sử dụng dịch vụ của WeBee Bakery, bạn đồng ý tuân thủ các điều khoản này. Bạn phải đủ 18 tuổi hoặc được sự giám sát của người lớn để đặt hàng.

Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong trường hợp có dấu hiệu gian lận hoặc thông tin không hợp lệ.`,
  },
};

@Component({
  selector: 'app-policy-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="content-page">
      <div class="content-page__inner content-page__inner--narrow" style="padding:48px 0">
        @if (policy(); as p) {
          <h1 class="content-page__title">{{ p.title }}</h1>
          <div class="policy-content">{{ p.content }}</div>
        } @else {
          <p>Không tìm thấy chính sách.</p>
        }

        <nav class="policy-nav">
          <strong>Các chính sách:</strong>
          <a routerLink="/policies/privacy">Bảo mật</a>
          <a routerLink="/policies/shipping">Vận chuyển</a>
          <a routerLink="/policies/returns">Đổi trả</a>
          <a routerLink="/policies/terms">Điều khoản</a>
        </nav>
      </div>
    </div>
  `,
  styleUrl: '../../blog/pages/content.page.scss',
})
export class PolicyPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly policy = signal<PolicyContent | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const slug = p.get('slug') ?? '';
      this.policy.set(POLICIES[slug] ?? null);
    });
  }
}
