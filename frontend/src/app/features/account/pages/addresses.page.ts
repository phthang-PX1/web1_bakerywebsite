import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UsersApi } from '../../../core/api/users.api';
import { ToastService } from '../../../core/services/toast.service';
import type { Address } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-addresses-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ConfirmDialogComponent, LoadingSpinnerComponent],
  templateUrl: './addresses.page.html',
  styleUrl: './account-form.page.scss',
})
export class AddressesPage implements OnInit {
  private readonly usersApi = inject(UsersApi);
  private readonly toastService = inject(ToastService);

  readonly addresses = signal<Address[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly editingAddress = signal<Address | null>(null);
  readonly deletingAddressId = signal<string | null>(null);
  readonly saving = signal(false);

  readonly form = new FormGroup({
    recipientName: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    street: new FormControl('', [Validators.required]),
    district: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    isDefault: new FormControl(false),
  });

  ngOnInit(): void {
    this.load();
  }

  openAdd(): void {
    this.editingAddress.set(null);
    this.form.reset({ isDefault: false });
    this.showForm.set(true);
  }

  openEdit(address: Address): void {
    this.editingAddress.set(address);
    this.form.patchValue({ ...address });
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingAddress.set(null);
    this.form.reset();
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const payload = {
      recipientName: v.recipientName!,
      phone: v.phone!,
      street: v.street!,
      district: v.district!,
      city: v.city!,
      isDefault: v.isDefault ?? false,
    };
    const editing = this.editingAddress();
    const req = editing
      ? this.usersApi.updateAddress(editing.addressId, payload)
      : this.usersApi.createAddress(payload);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancel();
        this.load();
        this.toastService.success(editing ? 'Đã cập nhật địa chỉ.' : 'Đã thêm địa chỉ mới.');
      },
      error: () => { this.saving.set(false); this.toastService.error('Lưu địa chỉ thất bại.'); },
    });
  }

  deleteAddress(): void {
    const id = this.deletingAddressId();
    if (!id) return;
    this.usersApi.deleteAddress(id).subscribe({
      next: () => { this.load(); this.toastService.success('Đã xóa địa chỉ.'); },
      error: () => this.toastService.error('Xóa địa chỉ thất bại.'),
    });
    this.deletingAddressId.set(null);
  }

  private load(): void {
    this.usersApi.getAddresses().subscribe({
      next: (list) => { this.addresses.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
