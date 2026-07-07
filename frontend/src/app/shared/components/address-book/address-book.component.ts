import { Component, OnInit, inject, input, signal } from '@angular/core';

import { UsersApi } from '../../../core/api/users.api';
import type { Address } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { AddressFormDialogComponent } from '../address-form-dialog/address-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [AddressFormDialogComponent, ConfirmDialogComponent, LoadingSpinnerComponent],
  templateUrl: './address-book.component.html',
  styleUrl: './address-book.component.scss',
})
export class AddressBookComponent implements OnInit {
  private readonly usersApi = inject(UsersApi);
  private readonly toastService = inject(ToastService);

  /** Compact mode hides the section chrome so it can be embedded inside another card. */
  readonly compact = input(false);

  readonly addresses = signal<Address[]>([]);
  readonly loading = signal(true);
  readonly dialogOpen = signal(false);
  readonly editingAddress = signal<Address | null>(null);
  readonly deletingAddressId = signal<string | null>(null);
  readonly settingDefaultId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  openAdd(): void {
    this.editingAddress.set(null);
    this.dialogOpen.set(true);
  }

  openEdit(address: Address): void {
    this.editingAddress.set(address);
    this.dialogOpen.set(true);
  }

  onSaved(): void {
    this.dialogOpen.set(false);
    this.editingAddress.set(null);
    this.load();
  }

  setDefault(address: Address): void {
    if (address.isDefault || this.settingDefaultId()) return;
    this.settingDefaultId.set(address.addressId);
    this.usersApi.updateAddress(address.addressId, { isDefault: true }).subscribe({
      next: () => {
        this.settingDefaultId.set(null);
        this.load();
        this.toastService.success('Đã đặt làm địa chỉ mặc định.');
      },
      error: () => {
        this.settingDefaultId.set(null);
        this.toastService.error('Không thể đặt địa chỉ mặc định.');
      },
    });
  }

  deleteAddress(): void {
    const id = this.deletingAddressId();
    if (!id) return;
    this.usersApi.deleteAddress(id).subscribe({
      next: () => {
        this.load();
        this.toastService.success('Đã xóa địa chỉ.');
      },
      error: () => this.toastService.error('Xóa địa chỉ thất bại.'),
    });
    this.deletingAddressId.set(null);
  }

  private load(): void {
    this.usersApi.getAddresses().subscribe({
      next: (list) => {
        this.addresses.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
