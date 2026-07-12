/**
 * Nguồn ảnh danh mục DÙNG CHUNG cho cả client (home) và admin, để hai bên
 * không còn lệch nhau (xem business-problem.md C-1).
 *
 * Quyết định: ưu tiên bộ SVG minh họa đẹp của client (/assets/categories/*.svg),
 * map theo slug. Admin trước đây dùng bộ icon riêng + category.imageUrl → gây lệch;
 * nay cả hai cùng gọi hàm này.
 */

const CATEGORY_SVG_BASE = '/assets/categories';

/** Map slug chính xác → tên file SVG (không có đuôi). */
const EXACT_SLUG_TO_SVG: Readonly<Record<string, string>> = {
  'banh-gato': 'banh-gato',
  'banh-entremet': 'banh-entremet',
  'banh-mousse': 'banh-mousse',
  'banh-nuong': 'banh-nuong',
  tiramisu: 'tiramisu',
  'mini-cakes': 'mini-cakes',
};

/** SVG mặc định khi không suy ra được từ slug. */
const DEFAULT_CATEGORY_SVG = `${CATEGORY_SVG_BASE}/banh-gato.svg`;

/**
 * Trả về đường dẫn SVG minh họa cho một danh mục dựa trên slug.
 * Dùng cho CẢ client và admin để đảm bảo hiển thị giống hệt nhau.
 */
export const getCategoryImage = (slug: string | null | undefined): string => {
  const key = (slug ?? '').toLowerCase().trim();

  // 1) Khớp slug chính xác.
  const exact = EXACT_SLUG_TO_SVG[key];
  if (exact) {
    return `${CATEGORY_SVG_BASE}/${exact}.svg`;
  }

  // 2) Heuristic cho slug lạ (danh mục admin tạo mới với slug tùy ý).
  if (key.includes('gato') || key.includes('kem')) return `${CATEGORY_SVG_BASE}/banh-gato.svg`;
  if (key.includes('mousse')) return `${CATEGORY_SVG_BASE}/banh-mousse.svg`;
  if (key.includes('entremet')) return `${CATEGORY_SVG_BASE}/banh-entremet.svg`;
  if (key.includes('nuong') || key.includes('baked') || key.includes('nướng'))
    return `${CATEGORY_SVG_BASE}/banh-nuong.svg`;
  if (key.includes('tiramisu')) return `${CATEGORY_SVG_BASE}/tiramisu.svg`;
  if (key.includes('mini')) return `${CATEGORY_SVG_BASE}/mini-cakes.svg`;

  // 3) Mặc định.
  return DEFAULT_CATEGORY_SVG;
};
