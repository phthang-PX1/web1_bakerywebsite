import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UsersApi } from '../../../core/api/users.api';
import { ADDRESS_CITIES, getDistrictsByCity } from '../../../core/constants/vietnam-addresses';
import type { Address } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Modal for creating/editing a delivery address.
 *
 * With `persist` (the default) it saves through the users API and emits the stored
 * {@link Address}. With `persist=false` — e.g. a guest checkout with no account — it
 * skips the API and emits the entered values as an ephemeral address for the caller
 * to use for a single order.
 */
@Component({
  selector: 'app-address-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './address-form-dialog.component.html',
  styleUrl: './address-form-dialog.component.scss',
})
export class AddressFormDialogComponent {
  private readonly usersApi = inject(UsersApi);
  private readonly toastService = inject(ToastService);

  readonly open = input(false);
  /** Address to edit; null opens a blank "add" form. */
  readonly address = input<Address | null>(null);
  /** When false the address is not stored server-side, only emitted (guest flow). */
  readonly persist = input(true);
  /** Pre-checks "set as default" (e.g. the user's first address). */
  readonly defaultChecked = input(false);

  readonly saved = output<Address>();
  readonly dismissed = output<void>();

  readonly saving = signal(false);
  readonly cities = ADDRESS_CITIES;
  readonly districts = signal<readonly string[]>([]);

  readonly form = new FormGroup({
    recipientName: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    street: new FormControl('', [Validators.required]),
    district: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    isDefault: new FormControl(false),
  });

  constructor() {
    this.form.controls.city.valueChanges.subscribe((city) => {
      const districts = getDistrictsByCity(city);
      this.districts.set(districts);
      if (!districts.includes(this.form.controls.district.value ?? '')) {
        this.form.controls.district.setValue('');
      }
    });

    // Re-seed the form each time the dialog opens.
    effect(() => {
      if (!this.open()) return;
      untracked(() => this.reset());
    });
  }

  get isEditing(): boolean {
    return !!this.address();
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.value;
    const payload = {
      recipientName: v.recipientName!,
      phone: v.phone!,
      street: v.street!,
      district: v.district!,
      city: v.city!,
      isDefault: v.isDefault ?? false,
    };

    if (!this.persist()) {
      this.saved.emit({
        addressId: this.address()?.addressId ?? '',
        userId: '',
        ...payload,
      });
      return;
    }

    this.saving.set(true);
    const editing = this.address();
    const req = editing
      ? this.usersApi.updateAddress(editing.addressId, payload)
      : this.usersApi.createAddress(payload);
    req.subscribe({
      next: (address) => {
        this.saving.set(false);
        this.toastService.success(editing ? 'Đã cập nhật địa chỉ.' : 'Đã thêm địa chỉ mới.');
        this.saved.emit(address);
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error('Lưu địa chỉ thất bại.');
      },
    });
  }

  private reset(): void {
    const editing = this.address();
    if (editing) {
      this.districts.set(getDistrictsByCity(editing.city));
      this.form.reset({ ...editing });
    } else {
      this.districts.set([]);
      this.form.reset({ isDefault: this.defaultChecked() });
    }
  }
}
