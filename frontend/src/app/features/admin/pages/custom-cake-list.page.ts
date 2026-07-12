import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';

import { AdminApi } from '../../../core/api/admin.api';
import { ToastService } from '../../../core/services/toast.service';
import type { OptionGroup, OptionItem } from '../../../core/models/product.model';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-custom-cake-list-page',
  standalone: true,
  imports: [FormsModule, CurrencyVndPipe, LoadingSpinnerComponent, ImgFallbackDirective],
  template: `
    <div class="admin-page" style="max-width: 1100px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px;">
        <div>
          <h1 style="margin: 0; font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800;">Quản lý thành phần</h1>
          <p style="margin: 4px 0 0; color: #7a6555; font-size: 14.5px;">Các nhóm thành phần (nhân, kem phủ, topping, kích cỡ...) dùng chung cho bánh tùy chỉnh phía khách hàng.</p>
        </div>
        <button (click)="openCreateGroup()" style="background: #f5c842; color: #2b1a0f; border: none; font-weight: 800; padding: 11px 20px; border-radius: 10px; cursor: pointer; font-size: 13.5px; white-space: nowrap;">
          + Thêm nhóm
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div style="display: flex; flex-direction: column; gap: 16px;">
          @for (group of groups(); track group.groupId) {
            <div class="dashboard-card" style="border: 1px solid #ede8e2; border-radius: 16px; background: #fff; overflow: hidden;">
              <!-- Group header -->
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #fffbf7; border-bottom: 1.5px solid #ede8e2; gap: 12px;">
                <div>
                  <span style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800;">{{ group.name }}</span>
                  <span style="margin-left: 10px; font-size: 12px; color: #7a6555; font-weight: 600;">
                    {{ group.isMultiple ? 'Chọn nhiều' : 'Chọn một' }}{{ group.isRequired ? ' · Bắt buộc' : '' }} · {{ group.items.length }} thành phần
                  </span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button (click)="openAddItem(group)" style="background: #fff; border: 1.5px solid #ede8e2; color: #c96a2e; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12.5px; font-weight: 700;">+ Thành phần</button>
                  <button (click)="openEditGroup(group)" style="background: #fff; border: 1.5px solid #ede8e2; color: #7a6555; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12.5px; font-weight: 700;">Sửa nhóm</button>
                  <button (click)="deleteGroup(group)" style="background: #fee2e2; border: 1.5px solid #fca5a5; color: #dc2626; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12.5px; font-weight: 700;">Xóa</button>
                </div>
              </div>

              <!-- Items -->
              <div style="padding: 8px 12px;">
                @for (item of group.items; track item.itemId) {
                  <div style="display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-bottom: 1px solid #f3ece3;">
                    <div style="width: 44px; height: 44px; border-radius: 8px; overflow: hidden; background: #f9ede0; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                      @if (item.imageUrl) {
                        <img [src]="item.imageUrl" [alt]="item.name" appImgFallback style="width: 100%; height: 100%; object-fit: cover;" />
                      } @else {
                        <span style="font-weight: 800; color: #c96a2e;">{{ item.name[0] }}</span>
                      }
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 700; color: #2b1a0f;">{{ item.name }}</div>
                      <div style="font-size: 12.5px; color: #7a6555;">
                        {{ item.extraPrice > 0 ? ('+' + (item.extraPrice | currencyVnd)) : 'Miễn phí' }}
                      </div>
                    </div>
                    <span [style.background]="item.isActive ? '#e8fdf0' : '#fef2f2'" [style.color]="item.isActive ? '#16a34a' : '#dc2626'" style="font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 99px;">
                      {{ item.isActive ? 'Hiện' : 'Ẩn' }}
                    </span>
                    <button (click)="openEditItem(group, item)" style="background: #fff; border: 1.5px solid #ede8e2; color: #7a6555; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700;">Sửa</button>
                    <button (click)="toggleItem(item)" [style.color]="item.isActive ? '#dc2626' : '#16a34a'" style="background: #fff; border: 1.5px solid #ede8e2; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700;">{{ item.isActive ? 'Ẩn' : 'Hiện' }}</button>
                  </div>
                } @empty {
                  <p style="text-align: center; padding: 16px; color: #7a6555; font-size: 13px; font-weight: 600;">Chưa có thành phần nào trong nhóm này.</p>
                }
              </div>
            </div>
          } @empty {
            <div class="dashboard-card" style="padding: 40px; text-align: center; color: #7a6555; font-weight: 600; border: 1.5px dashed #ede8e2; border-radius: 16px;">
              Chưa có nhóm thành phần dùng chung nào. Bấm "Thêm nhóm" để bắt đầu.
            </div>
          }
        </div>
      }

      <!-- Modal: Group -->
      @if (groupModal()) {
        <div style="position: fixed; inset: 0; background: rgba(43,26,15,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000;" (click)="groupModal.set(false)">
          <div (click)="$event.stopPropagation()" style="background: #fff; border-radius: 16px; width: 90%; max-width: 440px; padding: 24px;">
            <h3 style="margin: 0 0 18px; font-family: 'Fraunces', serif; font-size: 20px; font-weight: 800;">{{ editingGroupId() ? 'Sửa nhóm' : 'Thêm nhóm mới' }}</h3>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Tên nhóm *</label>
            <input [(ngModel)]="gName" placeholder="VD: Nhân bánh, Topping, Kích cỡ..." style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; box-sizing: border-box; margin-bottom: 14px;" />
            <div style="display: flex; gap: 16px; margin-bottom: 16px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; cursor: pointer;">
                <input type="checkbox" [(ngModel)]="gMultiple" style="width: 16px; height: 16px; accent-color: #f5c842;" /> Cho chọn nhiều
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; cursor: pointer;">
                <input type="checkbox" [(ngModel)]="gRequired" style="width: 16px; height: 16px; accent-color: #f5c842;" /> Bắt buộc chọn
              </label>
            </div>

            @if (gMultiple) {
              <!-- Quy tắc chọn cho nhóm nhiều lựa chọn (thay cho hardcode client cũ) -->
              <div style="background: #fffbf7; border: 1.5px solid #f3ece3; border-radius: 10px; padding: 14px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px;">
                <div style="font-size: 12px; font-weight: 800; color: #7a6555; text-transform: uppercase;">Quy tắc chọn nhiều</div>
                <div style="display: flex; gap: 12px;">
                  <div style="flex: 1;">
                    <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; margin-bottom: 4px;">Tối đa được chọn</label>
                    <input type="number" min="1" [(ngModel)]="gMaxSelect" placeholder="Không giới hạn" style="width: 100%; padding: 8px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; box-sizing: border-box;" />
                  </div>
                  <div style="flex: 1;">
                    <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; margin-bottom: 4px;">Số lượng miễn phí</label>
                    <input type="number" min="0" [(ngModel)]="gFreeQty" placeholder="0" style="width: 100%; padding: 8px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; box-sizing: border-box;" />
                  </div>
                  <div style="flex: 1;">
                    <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; margin-bottom: 4px;">Phụ phí mỗi cái vượt (đ)</label>
                    <input type="number" min="0" [(ngModel)]="gSurcharge" placeholder="0" style="width: 100%; padding: 8px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; box-sizing: border-box;" />
                  </div>
                </div>
                <p style="font-size: 11.5px; color: #9c8a78; font-weight: 600; margin: 0;">VD: nhân bánh tối đa 2; topping miễn phí 2 cái đầu, từ cái thứ 3 phụ phí 15.000đ.</p>
              </div>
            }
            <div style="display: flex; gap: 12px;">
              <button (click)="groupModal.set(false)" style="flex: 1; padding: 10px; border-radius: 8px; border: 1.5px solid #ede8e2; background: #fff; color: #7a6555; cursor: pointer; font-weight: 700;">Hủy</button>
              <button (click)="saveGroup()" [disabled]="saving()" style="flex: 1; padding: 10px; border-radius: 8px; border: none; background: #f5c842; color: #2b1a0f; cursor: pointer; font-weight: 800;">Lưu</button>
            </div>
          </div>
        </div>
      }

      <!-- Modal: Item -->
      @if (itemModal()) {
        <div style="position: fixed; inset: 0; background: rgba(43,26,15,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000;" (click)="itemModal.set(false)">
          <div (click)="$event.stopPropagation()" style="background: #fff; border-radius: 16px; width: 90%; max-width: 440px; padding: 24px;">
            <h3 style="margin: 0 0 18px; font-family: 'Fraunces', serif; font-size: 20px; font-weight: 800;">{{ editingItemId() ? 'Sửa thành phần' : 'Thêm thành phần' }}</h3>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Tên thành phần *</label>
            <input [(ngModel)]="iName" placeholder="VD: Dâu tươi, Kem bơ..." style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; box-sizing: border-box; margin-bottom: 14px;" />
            <label style="display: block; font-size: 12px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Giá cộng thêm (đ)</label>
            <input type="number" min="0" [(ngModel)]="iPrice" placeholder="0" style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; box-sizing: border-box; margin-bottom: 14px;" />
            <label style="display: block; font-size: 12px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Ảnh minh họa</label>
            @if (iPreview()) {
              <img [src]="iPreview()" appImgFallback style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 1.5px solid #ede8e2; margin-bottom: 8px;" />
            }
            <input type="file" accept="image/*" (change)="onItemImage($event)" style="width: 100%; font-size: 13px; color: #7a6555; margin-bottom: 20px;" />
            <div style="display: flex; gap: 12px;">
              <button (click)="itemModal.set(false)" style="flex: 1; padding: 10px; border-radius: 8px; border: 1.5px solid #ede8e2; background: #fff; color: #7a6555; cursor: pointer; font-weight: 700;">Hủy</button>
              <button (click)="saveItem()" [disabled]="saving()" style="flex: 1; padding: 10px; border-radius: 8px; border: none; background: #f5c842; color: #2b1a0f; cursor: pointer; font-weight: 800;">Lưu</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './admin.page.scss',
})
export class AdminCustomCakeListPage implements OnInit {
  private readonly adminApi = inject(AdminApi);
  private readonly toastService = inject(ToastService);

  readonly groups = signal<OptionGroup[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);

  // Group modal
  readonly groupModal = signal(false);
  readonly editingGroupId = signal<string | null>(null);
  gName = '';
  gMultiple = false;
  gRequired = false;
  gMaxSelect: number | null = null;
  gFreeQty = 0;
  gSurcharge = 0;

  // Item modal
  readonly itemModal = signal(false);
  readonly editingItemId = signal<string | null>(null);
  private itemGroupId: string | null = null;
  private itemFile: File | null = null;
  private existingItemImage: string | null = null;
  iName = '';
  iPrice = 0;
  readonly iPreview = signal<string | null>(null);

  ngOnInit(): void {
    this.loadClientOptionGroups();
  }

  private loadClientOptionGroups(): void {
    this.loading.set(true);
    this.adminApi.getProducts({ limit: 500 }).pipe(
      switchMap((products) => {
        const customProduct = products.items.find((product) => product.isCustomizable);

        return forkJoin({
          shared: this.adminApi.getSharedOptionGroups(),
          product: customProduct ? this.adminApi.getSharedOptionGroups(customProduct.productId) : of([]),
        });
      }),
    ).subscribe({
      next: ({ shared, product }) => {
        this.groups.set(this.mergeGroups(shared, product));
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status !== 401) this.toastService.error('Khong tai duoc danh sach thanh phan.');
      },
    });
  }

  load(): void {
    this.loading.set(true);
    this.adminApi.getSharedOptionGroups().subscribe({
      next: (list) => {
        this.groups.set([...list]);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status !== 401) this.toastService.error('Không tải được danh sách thành phần.');
      },
    });
  }

  // ── Group ──
  openCreateGroup(): void {
    this.editingGroupId.set(null);
    this.gName = '';
    this.gMultiple = false;
    this.gRequired = false;
    this.gMaxSelect = null;
    this.gFreeQty = 0;
    this.gSurcharge = 0;
    this.groupModal.set(true);
  }

  openEditGroup(group: OptionGroup): void {
    this.editingGroupId.set(group.groupId);
    this.gName = group.name;
    this.gMultiple = group.isMultiple;
    this.gRequired = group.isRequired;
    this.gMaxSelect = group.maxSelect ?? null;
    this.gFreeQty = group.freeQuantity ?? 0;
    this.gSurcharge = group.surchargePerExtra ?? 0;
    this.groupModal.set(true);
  }

  saveGroup(): void {
    if (!this.gName.trim()) {
      this.toastService.error('Vui lòng nhập tên nhóm.');
      return;
    }
    this.saving.set(true);
    const body = {
      name: this.gName.trim(),
      isMultiple: this.gMultiple,
      isRequired: this.gRequired,
      // Quy tắc chọn chỉ áp cho nhóm nhiều lựa chọn.
      maxSelect: this.gMultiple && this.gMaxSelect ? Number(this.gMaxSelect) : null,
      freeQuantity: this.gMultiple ? Number(this.gFreeQty) || 0 : 0,
      surchargePerExtra: this.gMultiple ? Number(this.gSurcharge) || 0 : 0,
    };
    const id = this.editingGroupId();
    const req$ = id
      ? this.adminApi.updateOptionGroup(id, body)
      : this.adminApi.createSharedOptionGroup(body);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.groupModal.set(false);
        this.toastService.success(id ? 'Đã cập nhật nhóm.' : 'Đã thêm nhóm mới.');
        this.loadClientOptionGroups();
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error(err?.error?.message || 'Lưu nhóm thất bại.');
      },
    });
  }

  deleteGroup(group: OptionGroup): void {
    if (!confirm(`Xóa nhóm "${group.name}" và toàn bộ thành phần trong đó?`)) return;
    this.adminApi.deleteOptionGroup(group.groupId).subscribe({
      next: () => {
        this.toastService.success('Đã xóa nhóm.');
        this.loadClientOptionGroups();
      },
      error: (err) => {
        this.toastService.error(err?.status === 409 ? 'Không thể xóa: nhóm đã được dùng trong đơn hàng.' : 'Xóa nhóm thất bại.');
      },
    });
  }

  // ── Item ──
  openAddItem(group: OptionGroup): void {
    this.itemGroupId = group.groupId;
    this.editingItemId.set(null);
    this.iName = '';
    this.iPrice = 0;
    this.itemFile = null;
    this.existingItemImage = null;
    this.iPreview.set(null);
    this.itemModal.set(true);
  }

  openEditItem(group: OptionGroup, item: OptionItem): void {
    this.itemGroupId = group.groupId;
    this.editingItemId.set(item.itemId);
    this.iName = item.name;
    this.iPrice = item.extraPrice;
    this.itemFile = null;
    this.existingItemImage = item.imageUrl;
    this.iPreview.set(item.imageUrl);
    this.itemModal.set(true);
  }

  onItemImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.itemFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.iPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  saveItem(): void {
    if (!this.iName.trim() || !this.itemGroupId) {
      this.toastService.error('Vui lòng nhập tên thành phần.');
      return;
    }
    this.saving.set(true);
    const id = this.editingItemId();
    const body = {
      name: this.iName.trim(),
      extraPrice: Number(this.iPrice) || 0,
      imageUrl: this.existingItemImage,
    };
    const req$ = id
      ? this.adminApi.updateOptionItem(id, body, this.itemFile ?? undefined)
      : this.adminApi.createOptionItem(this.itemGroupId, body, this.itemFile ?? undefined);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.itemModal.set(false);
        this.toastService.success(id ? 'Đã cập nhật thành phần.' : 'Đã thêm thành phần.');
        this.loadClientOptionGroups();
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error(err?.error?.message || 'Lưu thành phần thất bại.');
      },
    });
  }

  private mergeGroups(shared: OptionGroup[], product: OptionGroup[]): OptionGroup[] {
    const seen = new Set<string>();
    return [...shared, ...product].filter((group) => {
      if (seen.has(group.groupId)) return false;
      seen.add(group.groupId);
      return true;
    });
  }

  toggleItem(item: OptionItem): void {
    this.adminApi.toggleOptionItemStatus(item.itemId).subscribe({
      next: () => {
        this.toastService.success(`Đã ${item.isActive ? 'ẩn' : 'hiện'} "${item.name}".`);
        this.loadClientOptionGroups();
      },
      error: () => this.toastService.error('Thao tác thất bại.'),
    });
  }
}
