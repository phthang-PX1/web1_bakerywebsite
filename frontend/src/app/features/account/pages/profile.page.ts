import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { UsersApi } from '../../../core/api/users.api';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent, ImgFallbackDirective],
  templateUrl: './profile.page.html',
  styleUrl: './account-form.page.scss',
})
export class ProfilePage implements OnInit {
  private readonly usersApi = inject(UsersApi);
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly uploadingAvatar = signal(false);

  readonly profileForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    phone: new FormControl(''),
  });

  readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  ngOnInit(): void {
    const user = this.authService.currentUser$.value;
    if (user) {
      this.profileForm.patchValue({ fullName: user.fullName, phone: user.phone ?? '' });
    }
  }

  saveProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    this.usersApi.updateProfile({
      fullName: this.profileForm.value.fullName!,
      phone: this.profileForm.value.phone || undefined,
    }).subscribe({
      next: (user) => {
        this.savingProfile.set(false);
        this.authService.currentUser$.next(user);
        this.toastService.success('Đã cập nhật thông tin thành công.');
      },
      error: () => { this.savingProfile.set(false); this.toastService.error('Cập nhật thất bại.'); },
    });
  }

  savePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    this.usersApi.changePassword({
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!,
    }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.toastService.success('Mật khẩu đã được thay đổi.');
      },
      error: (err) => {
        this.savingPassword.set(false);
        if (err?.status === 401) this.toastService.error('Mật khẩu hiện tại không đúng.');
        else this.toastService.error('Thay đổi mật khẩu thất bại.');
      },
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingAvatar.set(true);
    this.usersApi.uploadAvatar(file).subscribe({
      next: ({ avatarUrl }) => {
        this.uploadingAvatar.set(false);
        const user = this.authService.currentUser$.value;
        if (user) this.authService.currentUser$.next({ ...user, avatarUrl });
        this.toastService.success('Ảnh đại diện đã được cập nhật.');
      },
      error: () => { this.uploadingAvatar.set(false); this.toastService.error('Tải ảnh thất bại.'); },
    });
  }
}
