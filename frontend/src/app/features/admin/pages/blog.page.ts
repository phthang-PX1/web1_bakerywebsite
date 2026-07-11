import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BlogService, type ManagedBlogPost } from '../../../core/services/blog.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImgFallbackDirective } from '../../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-blog-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ImgFallbackDirective],
  template: `
    <div class="admin-page" style="max-width: 1200px; margin: 0 auto; padding: 24px; font-family: 'Be Vietnam Pro', sans-serif; color: #2b1a0f;">
      
      <!-- Page Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px;">
        <div>
          <h1 class="admin-page__title" style="margin: 0; font-family: 'Fraunces', serif; font-size: 32px; font-weight: 800;">Quản lý tin tức & Blog</h1>
          <p class="admin-page__subtitle" style="margin: 4px 0 0; color: #7a6555; font-size: 14.5px;">Tạo mới, chỉnh sửa bài viết tin tức, công thức làm bánh đồng bộ thời gian thực với Client.</p>
        </div>
        @if (panelMode() === 'none') {
          <button 
            (click)="openCreatePanel()"
            style="background: #f5c842; color: #2b1a0f; border: none; font-weight: 800; padding: 11px 20px; border-radius: 10px; cursor: pointer; font-size: 13.5px; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s;"
            onmouseover="this.style.background='#e5b832'"
            onmouseout="this.style.background='#f5c842'"
          >
            + Viết bài mới
          </button>
        }
      </div>

      <!-- Database/API Gap Alert Box -->
      <div style="background-color: #fffbeb; border: 1.5px solid #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px; color: #b45309; font-size: 13.5px; font-weight: 600; line-height: 1.5;">
        ⚠️ <strong>Lưu ý nghiệp vụ:</strong> Backend hiện chưa có cơ sở dữ liệu và API cho Blog. 
        Để đáp ứng yêu cầu <strong>Single Source of Truth</strong>, toàn bộ hoạt động chỉnh sửa dưới đây được đồng bộ động qua <code>localStorage</code> và chia sẻ trực tiếp với trang Blog Client. 
        Khi Backend bổ sung các endpoint <code>/admin/blog</code>, dịch vụ chỉ cần trỏ HTTP API là hoàn thành.
      </div>

      <!-- Main Layout Grid -->
      <div style="display: grid; grid-template-columns: {{ panelMode() !== 'none' ? '380px 1fr' : '1fr' }}; gap: 24px; align-items: start;">
        
        <!-- Form Panel (Left side, only visible in create/edit mode) -->
        @if (panelMode() !== 'none') {
          <div class="dashboard-card" style="padding: 24px; background: #ffffff; border: 1px solid #ede8e2; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); position: sticky; top: 20px;">
            <h2 style="font-size: 18px; font-family: 'Fraunces', serif; color: #2b1a0f; margin: 0 0 20px; font-weight: 800;">
              {{ panelMode() === 'create' ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết' }}
            </h2>

            <form [formGroup]="postForm" (ngSubmit)="submitForm()" style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Tiêu đề *</label>
                <input 
                  formControlName="title" 
                  class="form-input" 
                  placeholder="Bí quyết nướng bánh bông lan ngon" 
                  style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; outline: none; box-sizing: border-box;"
                  (input)="autoGenerateSlug()"
                />
                @if (postForm.get('title')?.invalid && postForm.get('title')?.touched) {
                  <p style="color: #dc2626; font-size: 12px; margin: 4px 0 0; font-weight: 600;">Vui lòng điền tiêu đề bài viết.</p>
                }
              </div>

              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Slug đường dẫn *</label>
                <input 
                  formControlName="slug" 
                  class="form-input" 
                  placeholder="bi-quyet-nuong-banh" 
                  style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; outline: none; box-sizing: border-box;"
                />
                @if (postForm.get('slug')?.invalid && postForm.get('slug')?.touched) {
                  <p style="color: #dc2626; font-size: 12px; margin: 4px 0 0; font-weight: 600;">Slug không hợp lệ (chỉ chấp nhận chữ thường, số, dấu gạch ngang).</p>
                }
                @if (slugError()) {
                  <p style="color: #dc2626; font-size: 12px; margin: 4px 0 0; font-weight: 600;">Slug này đã tồn tại ở bài viết khác.</p>
                }
              </div>

              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Link ảnh nền (Cover URL) *</label>
                <input 
                  formControlName="coverImage" 
                  class="form-input" 
                  placeholder="https://res.cloudinary.com/..." 
                  style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; outline: none; box-sizing: border-box;"
                />
                @if (postForm.get('coverImage')?.invalid && postForm.get('coverImage')?.touched) {
                  <p style="color: #dc2626; font-size: 12px; margin: 4px 0 0; font-weight: 600;">Vui lòng nhập URL ảnh bìa hợp lệ.</p>
                }
              </div>

              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Tóm tắt ngắn *</label>
                <textarea 
                  formControlName="excerpt" 
                  class="form-textarea" 
                  rows="3" 
                  placeholder="Mô tả tóm tắt ngắn về bài viết xuất hiện ở trang danh sách..." 
                  style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; outline: none; box-sizing: border-box; resize: vertical;"
                ></textarea>
                @if (postForm.get('excerpt')?.invalid && postForm.get('excerpt')?.touched) {
                  <p style="color: #dc2626; font-size: 12px; margin: 4px 0 0; font-weight: 600;">Vui lòng nhập tóm tắt (tối đa 150 ký tự).</p>
                }
              </div>

              <div>
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Nội dung chi tiết *</label>
                <textarea 
                  formControlName="content" 
                  class="form-textarea" 
                  rows="10" 
                  placeholder="Soạn thảo nội dung bài viết..." 
                  style="width: 100%; padding: 10px 14px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; outline: none; box-sizing: border-box; resize: vertical; line-height: 1.6;"
                ></textarea>
                @if (postForm.get('content')?.invalid && postForm.get('content')?.touched) {
                  <p style="color: #dc2626; font-size: 12px; margin: 4px 0 0; font-weight: 600;">Vui lòng nhập nội dung bài viết.</p>
                }
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display: block; font-size: 11.5px; font-weight: 700; color: #7a6555; text-transform: uppercase; margin-bottom: 6px;">Ngày đăng</label>
                  <input 
                    type="date"
                    formControlName="publishedAt" 
                    class="form-input" 
                    style="width: 100%; padding: 9px 12px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 13.5px; outline: none; box-sizing: border-box;"
                  />
                </div>
                <div style="display: flex; align-items: center; padding-top: 22px;">
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #2b1a0f; cursor: pointer;">
                    <input type="checkbox" formControlName="isActive" style="width: 16px; height: 16px; accent-color: #f5c842;" />
                    Hiển thị bài viết
                  </label>
                </div>
              </div>

              <div style="display: flex; gap: 12px; margin-top: 10px;">
                <button 
                  type="button" 
                  (click)="cancelForm()"
                  style="flex: 1; padding: 10px; border-radius: 8px; border: 1.5px solid #ede8e2; background: #fff; color: #7a6555; cursor: pointer; font-weight: 700; font-size: 13.5px;"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  [disabled]="postForm.invalid"
                  style="flex: 1; padding: 10px; border-radius: 8px; border: none; background: #f5c842; color: #2b1a0f; cursor: pointer; font-weight: 800; font-size: 13.5px;"
                >
                  Lưu bài viết
                </button>
              </div>
            </form>
          </div>
        }

        <!-- List Section (Right side/Full width) -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          
          <!-- Filter & Search toolbar -->
          <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
            <div style="position: relative; flex: 1; min-width: 240px;">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Tìm theo tiêu đề, tóm tắt hoặc nội dung..."
                style="width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid #ede8e2; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none;"
              />
              <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #7a6555; display: flex; align-items: center;">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 11.5L15 15M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </div>

            <div style="display: flex; gap: 8px;">
              <button 
                (click)="activeTab.set('all')"
                [style.background]="activeTab() === 'all' ? '#f5c842' : '#ffffff'"
                [style.color]="activeTab() === 'all' ? '#2b1a0f' : '#7a6555'"
                [style.border-color]="activeTab() === 'all' ? '#f5c842' : '#ede8e2'"
                style="padding: 8px 16px; border: 1.5px solid; border-radius: 99px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; outline: none;"
              >
                Tất cả ({{ blogService.posts().length }})
              </button>
              <button 
                (click)="activeTab.set('active')"
                [style.background]="activeTab() === 'active' ? '#f5c842' : '#ffffff'"
                [style.color]="activeTab() === 'active' ? '#2b1a0f' : '#7a6555'"
                [style.border-color]="activeTab() === 'active' ? '#f5c842' : '#ede8e2'"
                style="padding: 8px 16px; border: 1.5px solid; border-radius: 99px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; outline: none;"
              >
                Hiển thị ({{ getCountByStatus(true) }})
              </button>
              <button 
                (click)="activeTab.set('inactive')"
                [style.background]="activeTab() === 'inactive' ? '#f5c842' : '#ffffff'"
                [style.color]="activeTab() === 'inactive' ? '#2b1a0f' : '#7a6555'"
                [style.border-color]="activeTab() === 'inactive' ? '#f5c842' : '#ede8e2'"
                style="padding: 8px 16px; border: 1.5px solid; border-radius: 99px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; outline: none;"
              >
                Đã ẩn ({{ getCountByStatus(false) }})
              </button>
            </div>
          </div>

          <!-- Articles Table -->
          <div class="dashboard-card" style="padding: 0; overflow: hidden; border: 1px solid #ede8e2; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <thead>
                  <tr style="background: #fffbf7; border-bottom: 2px solid #ede8e2;">
                    <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; width: 60px; text-align: center;">STT</th>
                    <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; width: 100px;">Ảnh bìa</th>
                    <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase;">Tiêu đề bài viết</th>
                    <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase;">Slug / Tóm tắt</th>
                    <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center; width: 110px;">Ngày đăng</th>
                    <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: center; width: 120px;">Trạng thái</th>
                    <th style="padding: 14px 16px; font-weight: 800; color: #7a6555; font-size: 11.5px; text-transform: uppercase; text-align: right; width: 180px;">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  @for (post of filteredPosts(); track post.slug; let idx = $index) {
                    <tr style="border-bottom: 1px solid #f3ece3; transition: background 0.15s;" onmouseover="this.style.background='#fffcf9'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 14px 16px; text-align: center; font-weight: 700; color: #7a6555; vertical-align: middle;">{{ idx + 1 }}</td>
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        <div style="width: 72px; height: 48px; border-radius: 8px; overflow: hidden; border: 1px solid #ede8e2; background: #fffbf7; display: flex; align-items: center; justify-content: center;">
                          <img 
                            [src]="post.coverImage" 
                            [alt]="post.title" 
                            style="width: 100%; height: 100%; object-fit: cover;"
                            appImgFallback
                          />
                        </div>
                      </td>
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        <div style="font-weight: 800; color: #2b1a0f; line-height: 1.4; max-width: 250px;">{{ post.title }}</div>
                      </td>
                      <td style="padding: 14px 16px; vertical-align: middle;">
                        <code style="background: #f5e6d3; color: #7a3d18; padding: 2px 6px; border-radius: 4px; font-size: 11.5px; font-family: monospace; display: inline-block; margin-bottom: 4px;">{{ post.slug }}</code>
                        <div style="font-size: 12.5px; color: #7a6555; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{{ post.excerpt }}</div>
                      </td>
                      <td style="padding: 14px 16px; text-align: center; color: #7a6555; font-weight: 600; vertical-align: middle;">
                        {{ formatDate(post.publishedAt) }}
                      </td>
                      <td style="padding: 14px 16px; text-align: center; vertical-align: middle;">
                        <span 
                          [style.background-color]="post.isActive !== false ? '#e8fdf0' : '#fee2e2'"
                          [style.color]="post.isActive !== false ? '#16a34a' : '#dc2626'"
                          style="font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 99px; display: inline-block; border: 1.5px solid currentColor;"
                        >
                          {{ post.isActive !== false ? 'Hiển thị' : 'Đang ẩn' }}
                        </span>
                      </td>
                      <td style="padding: 14px 16px; text-align: right; vertical-align: middle;">
                        <div style="display: flex; gap: 8px; justify-content: flex-end;">
                          <button 
                            (click)="previewPost(post)"
                            style="background: #fff; border: 1.5px solid #ede8e2; color: #7a6555; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 700;"
                          >
                            Xem thử
                          </button>
                          <button 
                            (click)="startEdit(post)"
                            style="background: #fff; border: 1.5px solid #ede8e2; color: #c96a2e; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 700;"
                          >
                            Sửa
                          </button>
                          <button 
                            (click)="toggleActive(post)"
                            [style.color]="post.isActive !== false ? '#dc2626' : '#16a34a'"
                            style="background: #fff; border: 1.5px solid #ede8e2; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 700;"
                          >
                            {{ post.isActive !== false ? 'Ẩn' : 'Hiện' }}
                          </button>
                          <button 
                            (click)="deletePost(post)"
                            style="background: #fee2e2; border: 1.5px solid #fca5a5; color: #dc2626; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 700;"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" style="text-align: center; padding: 40px; color: #7a6555; font-weight: 600;">Không tìm thấy bài viết nào phù hợp.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    @if (selectedPost(); as p) {
      <div class="modal-backdrop-new" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(43, 26, 15, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;">
        <div style="background: #ffffff; border-radius: 16px; width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #ede8e2;">
          
          <!-- Modal Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1.5px solid #ede8e2; position: sticky; top: 0; background: #ffffff; z-index: 10;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; font-weight: 800; color: #7a6555; background: #fff5ee; border: 1px solid #f6eaba; padding: 2px 8px; border-radius: 99px;">PREVIEW CLIENT</span>
              <h3 style="margin: 0; font-family: 'Fraunces', serif; font-size: 18px; font-weight: 800;">Xem trước bài viết</h3>
            </div>
            <button 
              (click)="closePreview()"
              style="background: none; border: none; cursor: pointer; color: #7a6555; font-size: 18px; display: inline-flex;"
            >
              ✕
            </button>
          </div>

          <!-- Modal Body (Matching Client Blog detail exactly) -->
          <div style="padding: 24px;">
            <p style="font-size: 13.5px; color: #7a6555; font-weight: 600; margin: 0 0 8px;">{{ formatDate(p.publishedAt) }}</p>
            <h1 style="font-family: 'Fraunces', serif; font-size: 26px; font-weight: 800; color: #2b1a0f; margin: 0 0 16px; line-height: 1.3;">{{ p.title }}</h1>
            <div style="width: 100%; border-radius: 12px; overflow: hidden; border: 1.5px solid #ede8e2; margin-bottom: 20px; aspect-ratio: 16/9; background: #fffbf7;">
              <img [src]="p.coverImage" [alt]="p.title" style="width: 100%; height: 100%; object-fit: cover;" appImgFallback />
            </div>
            <div style="font-size: 15.5px; line-height: 1.7; color: #2b1a0f; white-space: pre-line;">{{ contentText(p) }}</div>
          </div>
          
          <!-- Modal Footer -->
          <div style="padding: 16px 24px; border-top: 1.5px solid #ede8e2; display: flex; justify-content: flex-end; background: #fffbf7; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
            <button 
              (click)="closePreview()"
              style="background: #f5c842; color: #2b1a0f; border: none; font-weight: 800; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 13.5px;"
            >
              Đóng xem thử
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './admin.page.scss',
})
export class AdminBlogPage implements OnInit {
  readonly blogService = inject(BlogService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // Forms and actions
  readonly postForm: FormGroup;
  readonly panelMode = signal<'create' | 'edit' | 'none'>('none');
  readonly editingSlug = signal<string | null>(null);
  readonly selectedPost = signal<ManagedBlogPost | null>(null);
  readonly slugError = signal(false);
  readonly saving = signal(false);

  // Filtering
  searchQuery = '';
  readonly activeTab = signal<'all' | 'active' | 'inactive'>('all');

  constructor() {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      coverImage: ['', Validators.required],
      excerpt: ['', [Validators.required, Validators.maxLength(150)]],
      content: ['', Validators.required],
      publishedAt: [new Date().toISOString().split('T')[0]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    // Initial fetch from service
  }

  getCountByStatus(isActive: boolean): number {
    return this.blogService.posts().filter(p => (p.isActive !== false) === isActive).length;
  }

  filteredPosts = computed(() => {
    const list = this.blogService.posts();
    const query = this.searchQuery.toLowerCase().trim();
    const tab = this.activeTab();

    return list.filter(p => {
      // 1. Status Filter
      if (tab === 'active' && p.isActive === false) return false;
      if (tab === 'inactive' && p.isActive !== false) return false;

      // 2. Search query filter
      if (query) {
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSlug = p.slug.toLowerCase().includes(query);
        const matchesExcerpt = p.excerpt.toLowerCase().includes(query);
        const matchesContent = this.contentText(p).toLowerCase().includes(query);
        return matchesTitle || matchesSlug || matchesExcerpt || matchesContent;
      }

      return true;
    });
  });

  // Slug auto generation
  autoGenerateSlug(): void {
    if (this.panelMode() === 'create') {
      const title = this.postForm.get('title')?.value || '';
      const generated = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      this.postForm.get('slug')?.setValue(generated);
    }
  }

  // Panel Handlers
  openCreatePanel(): void {
    this.postForm.reset({
      title: '',
      slug: '',
      coverImage: '',
      excerpt: '',
      content: '',
      publishedAt: new Date().toISOString().split('T')[0],
      isActive: true
    });
    this.editingSlug.set(null);
    this.slugError.set(false);
    this.panelMode.set('create');
  }

  startEdit(post: ManagedBlogPost): void {
    this.postForm.patchValue({
      title: post.title,
      slug: post.slug,
      coverImage: post.coverImage,
      excerpt: post.excerpt,
      content: this.contentText(post),
      publishedAt: post.publishedAt || new Date().toISOString().split('T')[0],
      isActive: post.isActive !== false
    });
    this.editingSlug.set(post.slug);
    this.slugError.set(false);
    this.panelMode.set('edit');
  }

  cancelForm(): void {
    this.panelMode.set('none');
    this.editingSlug.set(null);
    this.slugError.set(false);
  }

  submitForm(): void {
    if (this.postForm.invalid) return;
    this.saving.set(true);

    const postData: ManagedBlogPost = {
      ...this.postForm.value,
      galleryImages: [],
      category: 'Tin tức',
      readingTime: '3 phút đọc',
    };
    const mode = this.panelMode();
    const editSlug = this.editingSlug();

    if (mode === 'create') {
      const success = this.blogService.addPost(postData);
      if (success) {
        this.toastService.success('Đã thêm bài viết mới thành công!');
        this.cancelForm();
      } else {
        this.slugError.set(true);
        this.toastService.error('Thêm thất bại. Slug bị trùng lặp.');
      }
    } else if (mode === 'edit' && editSlug) {
      const success = this.blogService.updatePost(editSlug, postData);
      if (success) {
        this.toastService.success('Đã cập nhật bài viết thành công!');
        this.cancelForm();
      } else {
        this.slugError.set(true);
        this.toastService.error('Cập nhật thất bại. Slug bị trùng lặp với bài viết khác.');
      }
    }
    this.saving.set(false);
  }

  toggleActive(post: ManagedBlogPost): void {
    const success = this.blogService.togglePostActive(post.slug);
    if (success) {
      const isNowActive = this.blogService.posts().find(p => p.slug === post.slug)?.isActive !== false;
      const statusText = isNowActive ? 'hiển thị' : 'tạm ẩn';
      this.toastService.success(`Đã chuyển trạng thái bài viết sang: ${statusText}`);
    } else {
      this.toastService.error('Không thể chuyển trạng thái bài viết.');
    }
  }

  deletePost(post: ManagedBlogPost): void {
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}" không?`)) {
      const success = this.blogService.deletePost(post.slug);
      if (success) {
        this.toastService.success('Đã xóa bài viết thành công.');
      } else {
        this.toastService.error('Không thể xóa bài viết.');
      }
    }
  }

  // Previews
  previewPost(post: ManagedBlogPost): void {
    this.selectedPost.set(post);
  }

  closePreview(): void {
    this.selectedPost.set(null);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  contentText(post: ManagedBlogPost): string {
    return Array.isArray(post.content) ? post.content.join('\n\n') : post.content;
  }
}
