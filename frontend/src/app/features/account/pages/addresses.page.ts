import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AddressBookComponent } from '../../../shared/components/address-book/address-book.component';

@Component({
  selector: 'app-addresses-page',
  standalone: true,
  imports: [RouterLink, AddressBookComponent],
  templateUrl: './addresses.page.html',
  styleUrl: './account-form.page.scss',
})
export class AddressesPage {}
