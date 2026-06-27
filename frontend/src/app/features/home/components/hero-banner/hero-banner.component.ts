import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-banner',
  imports: [RouterLink],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss'
})
export class HeroBannerComponent {
  protected readonly heroImageUrl =
    'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492883/product-image/gato/suatuoi/gato-suatuoi%281%29.jpg';
}
