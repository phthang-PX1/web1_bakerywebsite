import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective {
  readonly appImgFallback = input<string>('/assets/images/product-placeholder.webp');

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    const fallback = this.appImgFallback();
    if (this.el.nativeElement.src !== fallback) {
      this.el.nativeElement.src = fallback;
    }
  }
}
