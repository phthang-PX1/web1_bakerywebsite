/**
 * Tiện ích hiển thị option bánh DÙNG CHUNG cho trang chi tiết sản phẩm và trang
 * tùy chỉnh bánh — để hai trang đồng bộ cách phân loại nhóm (nhân/topping/...)
 * và cách chọn ảnh minh họa từ asset (thay vì imageUrl từ DB).
 */

export type OptionKind = 'size' | 'filling' | 'cream' | 'topping' | 'other';

/** Chuẩn hoá tên (bỏ dấu, ký tự đặc biệt) để so khớp không phụ thuộc hoa/thường/dấu. */
export const optionNameKey = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** Phân loại nhóm option theo TÊN nhóm (không có field phân loại trong DB). */
export const optionKindFromName = (groupName: string | undefined | null): OptionKind => {
  const key = optionNameKey(groupName ?? '');
  if (key.includes('kichco')) return 'size';
  if (key.includes('nhan')) return 'filling';
  if (key.includes('kemphu')) return 'cream';
  if (key.includes('topping')) return 'topping';
  return 'other';
};

/** Bản đồ ảnh asset theo tên item đã chuẩn hoá. */
export const OPTION_IMAGE_BY_KEY: Record<string, string> = {
  banhquy: '/assets/images/topping-cookie.png',
  camtuoi: '/assets/images/topping-cam.png',
  chocolate: '/assets/images/mut-socola.png',
  dautuoi: '/assets/images/toppping-dau.png',
  ganachesocola: '/assets/images/kemphu-socola.png',
  kembo: '/assets/images/kemphu-bo.png',
  kemphomai: '/assets/images/nhan-kemphomai.png',
  kemtuoihong: '/assets/images/kemphu-dau.png',
  mutdau: '/assets/images/mutdau.png',
  nhanhatcaramel: '/assets/images/nhan-caramel.png',
  socola: '/assets/images/topping-socola.png',
  whippingcream: '/assets/images/topping-whipcream.png',
};

/** Ảnh minh họa cho một item option (từ asset theo tên); null nếu không khớp. */
export const getOptionImage = (itemName: string): string | null =>
  OPTION_IMAGE_BY_KEY[optionNameKey(itemName)] ?? null;
