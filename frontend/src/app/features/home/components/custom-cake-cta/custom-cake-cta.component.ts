import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-custom-cake-cta',
  imports: [RouterLink],
  templateUrl: './custom-cake-cta.component.html',
  styleUrl: './custom-cake-cta.component.scss'
})
export class CustomCakeCtaComponent {
  protected readonly cakeImageUrl =
    'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492851/product-image/entremet/Entremet_s12_OolongPeach.png';
}
