import { Directive, ElementRef, HostListener, input, OnInit } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective implements OnInit {
  readonly appImgFallback = input<string>('/assets/images/product-placeholder.svg');

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    const img = this.el.nativeElement;
    // Auto-enable lazy loading for performance
    if (!img.getAttribute('loading')) {
      img.loading = 'lazy';
    }

    // Optimize Cloudinary URLs automatically
    if (img.src && img.src.includes('/image/upload/') && !img.src.includes('f_auto')) {
      img.src = img.src.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    }
  }

  @HostListener('error')
  onError(): void {
    const fallback = this.appImgFallback();
    if (this.el.nativeElement.src !== fallback) {
      this.el.nativeElement.src = fallback;
    }
  }
}
