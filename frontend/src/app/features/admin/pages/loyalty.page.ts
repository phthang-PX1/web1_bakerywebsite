import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { AdminApi } from '../../../core/api/admin.api';


interface LoyaltyConfig {
  pointRate: '10000_1' | '20000_1' | '50000_1';
  fraudPrevention: boolean;
  cycle: '3_months' | '6_months' | '12_months';
  criteriaRevenue: boolean;
  criteriaOrders: boolean;
  logicProcessing: boolean;
}

const DEFAULT_CONFIG: LoyaltyConfig = {
  pointRate: '10000_1',
  fraudPrevention: true,
  cycle: '6_months',
  criteriaRevenue: true,
  criteriaOrders: true,
  logicProcessing: true
};

@Component({
  selector: 'app-admin-loyalty-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="loyalty-page" style="padding: 28px; font-family: 'Be Vietnam Pro', sans-serif; background: #fdfbf5; min-height: 100vh; color: #2b1a0f;">
      
      <!-- Top Action Bar (Tiêu đề và các nút thao tác) -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; max-width: 1000px; margin-left: auto; margin-right: auto;">
        <!-- Tiêu đề trang (Breadcrumb gọn gàng) -->
        <h1 style="font-family: 'Fraunces', serif; font-size: 26px; font-weight: 800; color: #2b1a0f; margin: 0; letter-spacing: -0.02em;">
          Tích điểm thành viên
        </h1>
        
        <div style="display: flex; gap: 12px;">
          <!-- Nút Đánh giá chu kỳ -->
          @if (!isEditMode()) {
            <button 
              (click)="evaluateCycles()"
              [disabled]="evaluating()"
              style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: #c96a2e; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; color: #ffffff; cursor: pointer; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif; box-shadow: 0 4px 6px rgba(201,106,46,0.15);"
              onmouseover="this.style.background='#b05720';"
              onmouseout="this.style.background='#c96a2e';"
            >
              {{ evaluating() ? 'Đang xử lý...' : 'Đánh giá chu kỳ xét hạng' }}
            </button>
          }

          <!-- Nút Chỉnh sửa -->
          @if (!isEditMode()) {
            <button 
              (click)="enableEdit()"
              style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 12px; font-size: 14px; font-weight: 700; color: #2b1a0f; cursor: pointer; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif; box-shadow: 0 2px 4px rgba(43,26,15,0.02);"
              onmouseover="this.style.background='#fffcf9'; this.style.borderColor='#f5c842';"
              onmouseout="this.style.background='#ffffff'; this.style.borderColor='#ede8e2';"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Chỉnh sửa
            </button>
          } @else {
            <button 
              (click)="cancelEdit()"
              style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 12px; font-size: 14px; font-weight: 700; color: #7a6555; cursor: pointer; transition: all 0.15s; font-family: 'Be Vietnam Pro', sans-serif;"
              onmouseover="this.style.background='#fbf9f6'"
              onmouseout="this.style.background='#ffffff'"
            >
              Hủy chỉnh sửa
            </button>
          }

          <!-- Nút Lưu cấu hình -->
          <button 
            (click)="saveConfig()"
            [disabled]="!isEditMode()"
            [style.opacity]="isEditMode() ? '1' : '0.6'"
            [style.cursor]="isEditMode() ? 'pointer' : 'not-allowed'"
            style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: #2b1a0f; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; color: #ffffff; transition: background 0.15s; font-family: 'Be Vietnam Pro', sans-serif; box-shadow: 0 4px 6px rgba(43,26,15,0.08);"
            onmouseover="this.style.background='#442918'"
            onmouseout="this.style.background='#2b1a0f'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Lưu cấu hình
          </button>
        </div>
      </div>

      <!-- Main Layout (Xếp chồng 1 cột dọc rộng rãi và đều chằn chặn giống hệt ảnh mẫu) -->
      <div style="display: flex; flex-direction: column; gap: 28px; max-width: 1000px; margin-left: auto; margin-right: auto;">
        
        <!-- CARD 1: CẤU HÌNH QUY TẮC TÍCH ĐIỂM -->
        <div class="card" style="background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 20px; padding: 28px; box-shadow: 0 4px 12px rgba(43,26,15,0.015);">
          <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800; color: #2b1a0f; margin: 0 0 24px; display: inline-flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c96a2e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            CẤU HÌNH QUY TẮC TÍCH ĐIỂM
          </h2>

          <!-- Tỷ lệ tích điểm cơ bản -->
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 800; color: #2b1a0f; margin-bottom: 8px;">Tỷ lệ tích điểm cơ bản</label>
            <div style="max-width: 480px;">
              <select 
                [disabled]="!isEditMode()" 
                [(ngModel)]="config.pointRate"
                style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 12px; font-size: 14.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;"
                [style.background]="!isEditMode() ? '#fffbf7' : '#ffffff'"
              >
                <option value="10000_1">10.000 đ = 1 điểm</option>
                <option value="20000_1">20.000 đ = 1 điểm</option>
                <option value="50000_1">50.000 đ = 1 điểm</option>
              </select>
            </div>
            <div style="font-size: 13px; color: #7a6555; font-weight: 600; margin-top: 6px; display: inline-flex; align-items: center; gap: 4px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Tính trên tổng tiền sau khi giảm giá
            </div>
          </div>

          <!-- Điều kiện cộng điểm -->
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 800; color: #2b1a0f; margin-bottom: 12px;">Điều kiện cộng điểm</label>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <!-- Giao tận nơi flow -->
              <div style="background: #fffbf7; border: 1.5px solid #f3ece3; border-radius: 14px; padding: 16px 20px;">
                <div style="font-size: 14.5px; font-weight: 800; color: #2b1a0f; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c96a2e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  Giao tận nơi
                </div>
                
                <div style="display: grid; grid-template-columns: 1.2fr auto 1.2fr auto 1.2fr auto 1.6fr; gap: 12px; align-items: center; font-size: 13px; font-weight: 700; color: #7a6555;">
                  <span style="background: #ffffff; border: 1.5px solid #ede8e2; padding: 10px 14px; border-radius: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">Chờ xác nhận</span>
                  <span style="color: #c96a2e; font-weight: 800; font-size: 16px;">→</span>
                  <span style="background: #ffffff; border: 1.5px solid #ede8e2; padding: 10px 14px; border-radius: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">Đang làm bánh</span>
                  <span style="color: #c96a2e; font-weight: 800; font-size: 16px;">→</span>
                  <span style="background: #ffffff; border: 1.5px solid #ede8e2; padding: 10px 14px; border-radius: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">Đang giao hàng</span>
                  <span style="color: #c96a2e; font-weight: 800; font-size: 16px;">→</span>
                  <span style="background: #fef3c7; border: 1.5px solid #feebc8; color: #b45309; padding: 10px 14px; border-radius: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Hoàn thành (Cộng điểm)">Hoàn thành (Cộng điểm)</span>
                </div>
              </div>

              <!-- Nhận tại cửa hàng flow -->
              <div style="background: #fffbf7; border: 1.5px solid #f3ece3; border-radius: 14px; padding: 16px 20px;">
                <div style="font-size: 14.5px; font-weight: 800; color: #2b1a0f; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c96a2e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Nhận tại cửa hàng
                </div>
                
                <div style="display: grid; grid-template-columns: 1.2fr auto 1.2fr auto 1.2fr auto 1.6fr; gap: 12px; align-items: center; font-size: 13px; font-weight: 700; color: #7a6555;">
                  <span style="background: #ffffff; border: 1.5px solid #ede8e2; padding: 10px 14px; border-radius: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">Chờ xác nhận</span>
                  <span style="color: #c96a2e; font-weight: 800; font-size: 16px;">→</span>
                  <span style="background: #ffffff; border: 1.5px solid #ede8e2; padding: 10px 14px; border-radius: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">Đang làm bánh</span>
                  <span style="color: #c96a2e; font-weight: 800; font-size: 16px;">→</span>
                  <span style="background: #ffffff; border: 1.5px solid #ede8e2; padding: 10px 14px; border-radius: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">Chờ khách lấy</span>
                  <span style="color: #c96a2e; font-weight: 800; font-size: 16px;">→</span>
                  <span style="background: #fef3c7; border: 1.5px solid #feebc8; color: #b45309; padding: 10px 14px; border-radius: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Hoàn thành (Cộng điểm)">Hoàn thành (Cộng điểm)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quy tắc chống gian lận -->
          <div style="border-top: 1.5px solid #f3ece3; padding-top: 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <label style="font-size: 14px; font-weight: 800; color: #2b1a0f;">Quy tắc chống gian lận</label>
                <span style="background: #f3f4f6; color: #4b5563; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px;">
                  🔒 Quy tắc cố định
                </span>
              </div>
              <div style="font-size: 13.5px; font-weight: 700; color: #ea580c;">
                Hủy đơn → Trừ lại điểm (loyalty_logs ghi âm)
              </div>
              @if (!config.fraudPrevention) {
                <div style="font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 6px;">
                  ⚠️ Cảnh báo: Tắt chống gian lận có thể làm sai lệch điểm khi đơn bị hủy.
                </div>
              }
            </div>

            <!-- Toggle switch for Fraud -->
            <button
              class="toggle-switch"
              [class.toggle-switch--on]="config.fraudPrevention"
              [disabled]="!isEditMode()"
              [style.opacity]="isEditMode() ? '1' : '0.6'"
              [style.cursor]="isEditMode() ? 'pointer' : 'not-allowed'"
              (click)="toggleFraud()"
              type="button"
            >
              <span class="toggle-switch__knob"></span>
            </button>
          </div>

        </div>

        <!-- CARD 2: CƠ CHẾ TÍCH ĐIỂM THEO HẠNG -->
        <div class="card" style="background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 20px; padding: 28px; box-shadow: 0 4px 12px rgba(43,26,15,0.015);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
            <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800; color: #2b1a0f; margin: 0; display: inline-flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c96a2e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              CƠ CHẾ TÍCH ĐIỂM THEO HẠNG
            </h2>
            <span style="background: #f3f4f6; color: #4b5563; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
              🔒 Quy tắc cố định
            </span>
          </div>

          <p style="font-size: 13.5px; color: #7a6555; line-height: 1.5; font-weight: 600; margin: 0 0 20px;">
            Hệ số nhân áp dụng tự động theo hạng hiện tại. Điểm tích lũy dùng để đổi voucher trong kho quà — không trừ trực tiếp vào đơn hàng.
          </p>

          <!-- Table -->
          <div style="border: 1.5px solid #ede8e2; border-radius: 16px; overflow: hidden; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(43,26,15,0.01);">
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
              <thead>
                <tr style="background: #fffbf7; border-bottom: 1.5px solid #ede8e2;">
                  <th style="padding: 14px 20px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Hạng</th>
                  <th style="padding: 14px 20px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Mức Chi Tiêu</th>
                  <th style="padding: 14px 20px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Điểm Nhận Được</th>
                  <th style="padding: 14px 20px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Hệ Số</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f3ece3;">
                  <td style="padding: 14px 20px; font-weight: 700;">
                    <span class="badge-tier badge-tier--member">Member</span>
                  </td>
                  <td style="padding: 14px 20px; font-weight: 600; color: #2b1a0f;">{{ rateText() }}</td>
                  <td style="padding: 14px 20px; font-weight: 700; color: #2b1a0f;">1 điểm</td>
                  <td style="padding: 14px 20px; font-weight: 800; color: #ea580c;">×1</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3ece3;">
                  <td style="padding: 14px 20px; font-weight: 700;">
                    <span class="badge-tier badge-tier--bronze">Bronze</span>
                  </td>
                  <td style="padding: 14px 20px; font-weight: 600; color: #2b1a0f;">{{ rateText() }}</td>
                  <td style="padding: 14px 20px; font-weight: 700; color: #2b1a0f;">1 điểm</td>
                  <td style="padding: 14px 20px; font-weight: 800; color: #ea580c;">×1</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3ece3;">
                  <td style="padding: 14px 20px; font-weight: 700;">
                    <span class="badge-tier badge-tier--silver">Silver</span>
                  </td>
                  <td style="padding: 14px 20px; font-weight: 600; color: #2b1a0f;">{{ rateText() }}</td>
                  <td style="padding: 14px 20px; font-weight: 700; color: #2b1a0f;">1,2 điểm</td>
                  <td style="padding: 14px 20px; font-weight: 800; color: #ea580c;">×1.2</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3ece3;">
                  <td style="padding: 14px 20px; font-weight: 700;">
                    <span class="badge-tier badge-tier--gold">Gold</span>
                  </td>
                  <td style="padding: 14px 20px; font-weight: 600; color: #2b1a0f;">{{ rateText() }}</td>
                  <td style="padding: 14px 20px; font-weight: 700; color: #2b1a0f;">1,5 điểm</td>
                  <td style="padding: 14px 20px; font-weight: 800; color: #ea580c;">×1.5</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; font-weight: 700;">
                    <span class="badge-tier badge-tier--diamond">Diamond</span>
                  </td>
                  <td style="padding: 14px 20px; font-weight: 600; color: #2b1a0f;">{{ rateText() }}</td>
                  <td style="padding: 14px 20px; font-weight: 700; color: #2b1a0f;">2 điểm</td>
                  <td style="padding: 14px 20px; font-weight: 800; color: #ea580c;">×2</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Example calculation dynamic -->
          <div style="font-size: 13.5px; color: #7a6555; font-style: italic; font-weight: 600;">
            Ví dụ: Silver chi 300.000đ → {{ exampleText() }}
          </div>
        </div>

        <!-- CARD 3: CẤU HÌNH CHU KỲ XÉT HẠNG -->
        <div class="card" style="background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 20px; padding: 28px; box-shadow: 0 4px 12px rgba(43,26,15,0.015);">
          <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800; color: #2b1a0f; margin: 0 0 24px; display: inline-flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c96a2e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            CẤU HÌNH CHU KỲ XÉT HẠNG
          </h2>

          <!-- Chu kỳ xét hạng select -->
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 800; color: #2b1a0f; margin-bottom: 8px;">Chu kỳ xét hạng</label>
            <div style="max-width: 480px;">
              <select 
                [disabled]="!isEditMode()" 
                [(ngModel)]="config.cycle"
                style="width: 100%; padding: 11px 14px; border: 1.5px solid #ede8e2; border-radius: 12px; font-size: 14.5px; font-weight: 700; color: #2b1a0f; background: #ffffff; outline: none; cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;"
                [style.background]="!isEditMode() ? '#fffbf7' : '#ffffff'"
              >
                <option value="3_months">3 tháng / lần</option>
                <option value="6_months">6 tháng / lần</option>
                <option value="12_months">12 tháng / lần</option>
              </select>
            </div>
          </div>

          <!-- Tiêu chí xét hạng checkboxes -->
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 800; color: #2b1a0f; margin-bottom: 12px;">Tiêu chí xét hạng</label>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Option 1: Doanh thu -->
              <label style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #2b1a0f; cursor: pointer;">
                <input 
                  type="checkbox" 
                  [(ngModel)]="config.criteriaRevenue"
                  [disabled]="!isEditMode()"
                  style="accent-color: #c96a2e; width: 18px; height: 18px; cursor: pointer;"
                />
                Tổng doanh thu
              </label>

              <!-- Option 2: Số đơn hàng -->
              <label style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #2b1a0f; cursor: pointer;">
                <input 
                  type="checkbox" 
                  [(ngModel)]="config.criteriaOrders"
                  [disabled]="!isEditMode()"
                  style="accent-color: #c96a2e; width: 18px; height: 18px; cursor: pointer;"
                />
                Số lượng đơn hàng
              </label>
            </div>

            <!-- Note -->
            <div style="font-size: 12.5px; color: #7a6555; font-weight: 600; margin-top: 10px; font-style: italic;">
              (*) Bắt buộc khách hàng phải thỏa mãn đồng thời cả 2 tiêu chí trên để xét hạng
            </div>
          </div>

          <!-- Logic xử lý toggle -->
          <div style="border-top: 1.5px solid #f3ece3; padding-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 800; color: #2b1a0f; margin-bottom: 4px;">Logic xử lý</label>
              <div style="font-size: 13.5px; font-weight: 600; color: #7a6555;">
                Giữ hạng tối thiểu hết chu kỳ, hạ xuống hạng tương ứng
              </div>
            </div>

            <!-- Toggle logic processing -->
            <button
              class="toggle-switch"
              [class.toggle-switch--on]="config.logicProcessing"
              [disabled]="!isEditMode()"
              [style.opacity]="isEditMode() ? '1' : '0.6'"
              [style.cursor]="isEditMode() ? 'pointer' : 'not-allowed'"
              (click)="toggleLogic()"
              type="button"
            >
              <span class="toggle-switch__knob"></span>
            </button>
          </div>

        </div>

        <!-- CARD 4: BẢNG PHÂN CẤP HẠNG THÀNH VIÊN -->
        <div class="card" style="background: #ffffff; border: 1.5px solid #ede8e2; border-radius: 20px; padding: 28px; box-shadow: 0 4px 12px rgba(43,26,15,0.015); margin-bottom: 24px;">
          <h2 style="font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800; color: #2b1a0f; margin: 0 0 24px; display: inline-flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c96a2e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
            BẢNG PHÂN CẤP HẠNG THÀNH VIÊN
          </h2>

          <!-- Table -->
          <div style="border: 1.5px solid #ede8e2; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 4px rgba(43,26,15,0.01);">
            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
              <thead>
                <tr style="background: #fffbf7; border-bottom: 1.5px solid #ede8e2;">
                  <th style="padding: 14px 18px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Hạng</th>
                  <th style="padding: 14px 18px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Số đơn tối thiểu</th>
                  <th style="padding: 14px 18px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Doanh thu tối thiểu</th>
                  <th style="padding: 14px 18px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; text-align: center;">Voucher/tháng</th>
                  <th style="padding: 14px 18px; font-weight: 800; color: #7a6555; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Ưu đãi đặc trưng</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f3ece3;">
                  <td style="padding: 14px 18px; font-weight: 700;">
                    <span class="badge-tier badge-tier--member">Member</span>
                  </td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">0 đơn</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">0 đ</td>
                  <td style="padding: 14px 18px; font-weight: 800; color: #2b1a0f; text-align: center;">0</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #2b1a0f;">Chào mừng: 1 voucher 10%</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3ece3;">
                  <td style="padding: 14px 18px; font-weight: 700;">
                    <span class="badge-tier badge-tier--bronze">Bronze</span>
                  </td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">&gt;= 2 đơn</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">&gt;= 500.000 đ</td>
                  <td style="padding: 14px 18px; font-weight: 800; color: #2b1a0f; text-align: center;">1</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #2b1a0f;">Giảm 5% đơn từ 200k</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3ece3;">
                  <td style="padding: 14px 18px; font-weight: 700;">
                    <span class="badge-tier badge-tier--silver">Silver</span>
                  </td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">&gt;= 4 đơn</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">&gt;= 1.200.000 đ</td>
                  <td style="padding: 14px 18px; font-weight: 800; color: #2b1a0f; text-align: center;">2</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #2b1a0f;">Tặng bánh mini sinh nhật</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3ece3;">
                  <td style="padding: 14px 18px; font-weight: 700;">
                    <span class="badge-tier badge-tier--gold">Gold</span>
                  </td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">&gt;= 6 đơn</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">&gt;= 2.500.000 đ</td>
                  <td style="padding: 14px 18px; font-weight: 800; color: #2b1a0f; text-align: center;">3</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #2b1a0f;">Freeship nội thành</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; font-weight: 700;">
                    <span class="badge-tier badge-tier--diamond">Diamond</span>
                  </td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">&gt;= 10 đơn</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #7a6555;">&gt;= 5.000.000 đ</td>
                  <td style="padding: 14px 18px; font-weight: 800; color: #2b1a0f; text-align: center;">4</td>
                  <td style="padding: 14px 18px; font-weight: 600; color: #2b1a0f;">Bánh sinh nhật full size</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    /* ==========================================
       LOYALTY MODULE SPECIFIC COMPONENT CSS
       ========================================== */
    .badge-tier {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-tier--member { background: #f3f4f6; color: #4b5563; }
    .badge-tier--bronze { background: #fff7ed; color: #c2410c; }
    .badge-tier--silver { background: #f0fdf4; color: #166534; }
    .badge-tier--gold { background: #fffde6; color: #a16207; }
    .badge-tier--diamond { background: #eff6ff; color: #1d4ed8; }

    /* Custom Toggle Switch Styles */
    .toggle-switch {
      width: 42px; height: 22px; border-radius: 99px;
      background: #e5e7eb; border: none; cursor: pointer;
      position: relative; transition: background 0.2s;
      display: inline-flex; align-items: center; padding: 2px;
      flex-shrink: 0; box-sizing: border-box;
    }
    .toggle-switch--on { background-color: #f5c842 !important; }
    .toggle-switch__knob {
      width: 18px; height: 18px; border-radius: 50%;
      background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.18);
      transition: transform 0.2s; position: absolute; left: 2px;
      transform: none;
    }
    .toggle-switch--on .toggle-switch__knob { transform: translateX(20px) !important; }
  `],
  styleUrl: './admin.page.scss',
})
export class AdminLoyaltyPage implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminApi = inject(AdminApi);

  readonly isEditMode = signal(false);
  readonly evaluating = signal(false);

  // Form states mapping
  config: LoyaltyConfig = { ...DEFAULT_CONFIG };

  // Helper signal for computed texts
  readonly rateText = computed(() => {
    switch (this.config.pointRate) {
      case '20000_1': return '20.000đ';
      case '50000_1': return '50.000đ';
      default: return '10.000đ';
    }
  });

  readonly exampleText = computed(() => {
    switch (this.config.pointRate) {
      case '20000_1': return '15 × 1.2 = 18 điểm';
      case '50000_1': return '6 × 1.2 = 7.2 điểm';
      default: return '30 × 1.2 = 36 điểm';
    }
  });

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    const raw = localStorage.getItem('webee_loyalty_config');
    if (raw) {
      this.config = JSON.parse(raw);
    } else {
      this.config = { ...DEFAULT_CONFIG };
      localStorage.setItem('webee_loyalty_config', JSON.stringify(DEFAULT_CONFIG));
    }
  }

  enableEdit(): void {
    this.isEditMode.set(true);
  }

  cancelEdit(): void {
    this.loadConfig(); // restore from disk
    this.isEditMode.set(false);
  }

  toggleFraud(): void {
    if (!this.isEditMode()) return;
    this.config.fraudPrevention = !this.config.fraudPrevention;
  }

  toggleLogic(): void {
    if (!this.isEditMode()) return;
    this.config.logicProcessing = !this.config.logicProcessing;
  }

  saveConfig(): void {
    if (!this.isEditMode()) return;
    
    // Validate that at least one criteria is selected
    if (!this.config.criteriaRevenue && !this.config.criteriaOrders) {
      alert('Cần chọn ít nhất một tiêu chí xét hạng!');
      return;
    }

    localStorage.setItem('webee_loyalty_config', JSON.stringify(this.config));
    this.isEditMode.set(false);
    this.toastService.success('Đã lưu cấu hình tích điểm thành công!');
  }

  evaluateCycles(): void {
    this.evaluating.set(true);
    this.adminApi.evaluateLoyaltyCycles().subscribe({
      next: () => {
        this.evaluating.set(false);
        this.toastService.success('Đã thực hiện đánh giá lại chu kỳ xét hạng cho toàn bộ thành viên thành công!');
      },
      error: (err) => {
        console.error('[Loyalty] Error evaluating loyalty cycles:', err);
        this.evaluating.set(false);
        this.toastService.error('Đánh giá chu kỳ xét hạng thất bại.');
      }
    });
  }
}
