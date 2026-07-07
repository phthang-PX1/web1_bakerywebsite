import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  private readonly defaultTitle = 'WeBee Bakery — Tiệm Bánh Ngọt Ngào & Tươi Mới Mỗi Ngày';
  private readonly defaultDescription =
    'Thưởng thức bánh kem sinh nhật, bánh tươi thủ công và đồ uống hảo hạng tại WeBee Bakery. Đặt bánh theo yêu cầu, giao hàng nhanh chóng, nguyên liệu cao cấp.';
  private readonly defaultImage = '/assets/images/og-default.jpg';

  setMeta(config: SeoConfig = {}): void {
    const title = config.title ? `${config.title} | WeBee Bakery` : this.defaultTitle;
    const description = config.description || this.defaultDescription;
    const image = config.image || this.defaultImage;
    const url = config.url || (typeof window !== 'undefined' ? window.location.href : '');
    const type = config.type || 'website';

    // Basic tags
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });

    // OpenGraph (Facebook, Zalo, LinkedIn)
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:site_name', content: 'WeBee Bakery' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
  }

  reset(): void {
    this.setMeta({});
  }
}
