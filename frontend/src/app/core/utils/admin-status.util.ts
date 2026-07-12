import type { Order, OrderStatus } from '../models/order.model';

/**
 * Nhãn + màu badge DÙNG CHUNG cho toàn bộ trang admin, để trạng thái hiển thị
 * nhất quán (màu, chữ) ở mọi nơi thay vì mỗi trang tự định nghĩa một kiểu.
 */

// ── Trạng thái đơn hàng ──────────────────────────────────────────────────────
export const orderStatusLabel = (order: Pick<Order, 'orderStatus' | 'fulfillmentType'>): string => {
  switch (order.orderStatus) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'processing': return 'Đang làm bánh';
    case 'ready': return order.fulfillmentType === 'delivery' ? 'Đang giao hàng' : 'Chờ khách lấy';
    case 'delivered': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    default: return order.orderStatus;
  }
};

export const orderStatusBadgeStyle = (order: Pick<Order, 'orderStatus' | 'fulfillmentType'>): string => {
  switch (order.orderStatus) {
    case 'pending': return 'background: #fff7ed; color: #ea580c;';
    case 'confirmed': return 'background: #ecfdf5; color: #047857;';
    case 'processing': return 'background: #eff6ff; color: #2563eb;';
    case 'ready':
      return order.fulfillmentType === 'delivery'
        ? 'background: #f5f3ff; color: #7c3aed;'
        : 'background: #fefce8; color: #ca8a04;';
    case 'delivered': return 'background: #f0fdf4; color: #16a34a;';
    case 'cancelled': return 'background: #fef2f2; color: #dc2626;';
    default: return 'background: #f3f4f6; color: #4b5563;';
  }
};

/** Cho nơi chỉ có chuỗi orderStatus (không có fulfillmentType). */
export const orderStatusLabelFromStatus = (status: OrderStatus | string): string =>
  orderStatusLabel({ orderStatus: status as OrderStatus, fulfillmentType: 'pickup' });

export const orderStatusBadgeStyleFromStatus = (status: OrderStatus | string): string =>
  orderStatusBadgeStyle({ orderStatus: status as OrderStatus, fulfillmentType: 'pickup' });

// ── Trạng thái hiển thị (active / ẩn) — dùng cho SP, danh mục, blog, banner... ──
export const ACTIVE_LABEL = 'Đang hiển thị';
export const INACTIVE_LABEL = 'Đã ẩn';

export const activeBadge = (isActive: boolean): { label: string; background: string; color: string } =>
  isActive
    ? { label: ACTIVE_LABEL, background: '#f0fdf4', color: '#16a34a' }
    : { label: INACTIVE_LABEL, background: '#fef2f2', color: '#dc2626' };
