import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyVnd',
  standalone: true
})
export class CurrencyVndPipe implements PipeTransform {
  transform(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0
    }).format(value) + ' ₫';
  }
}
