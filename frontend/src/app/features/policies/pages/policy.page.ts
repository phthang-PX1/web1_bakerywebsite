import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  'customer-support': {
    title: 'Chính sách Hỗ trợ Khách hàng',
    content: `WeBee Bakery luôn sẵn sàng hỗ trợ bạn trong suốt quá trình mua sắm và sau khi nhận hàng.

Kênh hỗ trợ:
• Hotline: 0123 456 789 (08:00–20:00 hàng ngày)
• Email: info@webee.com — phản hồi trong vòng 24 giờ
• Fanpage WeBee Bakery — nhắn tin trực tiếp

Phạm vi hỗ trợ: tư vấn chọn bánh, theo dõi đơn hàng, khiếu nại chất lượng, hướng dẫn bảo quản bánh và các vấn đề về tài khoản/điểm thưởng.

Với khiếu nại về chất lượng bánh, vui lòng cung cấp mã đơn hàng và ảnh chụp sản phẩm trong vòng 2 giờ sau khi nhận để được xử lý nhanh nhất (đổi bánh mới hoặc hoàn tiền).`,
  },
  loyalty: {
    title: 'Chính sách Khách hàng Thân thiết',
    content: `Chương trình thành viên WeBee tri ân khách hàng gắn bó bằng điểm thưởng và đặc quyền theo hạng.

Tích điểm: mỗi 10.000₫ chi tiêu nhận 1 điểm thưởng (nhân hệ số theo hạng thành viên). Điểm được cộng tự động khi đơn hàng giao thành công.

Hạng thành viên được xét theo chu kỳ 6 tháng dựa trên số đơn và tổng chi tiêu: Member → Bronze → Silver → Gold → Diamond. Hạng càng cao, hệ số tích điểm và ưu đãi càng lớn (chiết khấu, quà sinh nhật, ưu tiên hỗ trợ).

Xem chi tiết quyền lợi từng hạng tại trang Thành viên. Điểm thưởng và hạng có thể được điều chỉnh nếu đơn hàng bị hủy hoặc hoàn tiền.`,
  },
  'order-payment-guide': {
    title: 'Hướng dẫn Đặt hàng & Thanh toán',
    content: `Đặt hàng tại WeBee chỉ với vài bước:

1. Chọn bánh từ Menu hoặc thiết kế bánh riêng ở mục Tùy chỉnh bánh; chọn kích cỡ, nhân, topping theo ý thích rồi thêm vào giỏ.
2. Vào Giỏ hàng kiểm tra lại sản phẩm, số lượng; nhập mã giảm giá nếu có.
3. Tại trang Đặt hàng: chọn giao hàng tận nơi hoặc ghé lấy tại cửa hàng, điền thông tin người nhận, chọn ngày và khung giờ nhận bánh.
4. Chọn phương thức thanh toán và bấm Đặt hàng.

Phương thức thanh toán:
• COD — thanh toán tiền mặt khi nhận bánh.
• Chuyển khoản — quét mã QR hiển thị sau khi đặt; đơn được xác nhận tự động khi hệ thống ghi nhận thanh toán.

Lưu ý: bánh cần đặt trước ít nhất 24 giờ; bánh tùy chỉnh cần 48–72 giờ.`,
  },
  'shipping-guide': {
    title: 'Hướng dẫn Giao hàng',
    content: `WeBee giao bánh tận nơi miễn phí trong khu vực phục vụ.

Khung giờ giao: 08:00–10:00, 10:00–12:00, 13:00–15:00, 15:00–17:00, 17:00–19:00 — bạn chọn khung giờ khi đặt hàng.

Bánh lạnh được vận chuyển bằng thùng giữ nhiệt chuyên dụng. Khi nhận bánh, vui lòng kiểm tra tình trạng bánh trước khi ký nhận; nếu có vấn đề hãy liên hệ hotline ngay trong vòng 2 giờ.

Bảo quản sau khi nhận: bánh lạnh nên dùng trong 24 giờ, bảo quản ngăn mát 2–8°C; bánh nướng dùng ngon nhất trong ngày.

Nếu bạn chọn ghé lấy tại cửa hàng: WeBee Bakery — 123 Đường Ngọt Ngào, TP. Hồ Chí Minh (08:00–20:00 hàng ngày), vui lòng đọc mã đơn hàng khi đến nhận.`,
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
          <a routerLink="/policies/customer-support">Hỗ trợ khách hàng</a>
          <a routerLink="/policies/loyalty">Khách hàng thân thiết</a>
          <a routerLink="/policies/privacy">Bảo mật</a>
          <a routerLink="/policies/order-payment-guide">Đặt hàng &amp; Thanh toán</a>
          <a routerLink="/policies/shipping-guide">Giao hàng</a>
          <a routerLink="/policies/returns">Đổi trả</a>
          <a routerLink="/policies/terms">Điều khoản</a>
        </nav>
      </div>
    </div>
  `,
  styleUrl: '../../blog/pages/content.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolicyPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly policy = signal<PolicyContent | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      const slug = p.get('slug') ?? '';
      this.policy.set(POLICIES[slug] ?? null);
    });
  }
}
