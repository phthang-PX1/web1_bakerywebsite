// Khớp backend model BlogPost (backend/src/modules/blog).
export interface BlogPost {
  readonly postId: string;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly coverImage: string;
  readonly category: string;
  readonly readingTime: string;
  readonly content: string[];
  readonly galleryImages: string[];
  readonly publishedAt: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Payload tạo/sửa bài viết. Ảnh gửi qua FormData (file), text qua field thường. */
export interface BlogPostFormData {
  title: string;
  slug?: string;
  excerpt: string;
  category: string;
  readingTime?: string;
  content: string[];
  isActive?: boolean;
  coverImageFile?: File | null;
  /** Giữ URL ảnh bìa cũ khi sửa mà không đổi ảnh. */
  coverImageUrl?: string;
  galleryImageFiles?: File[];
  galleryImageUrls?: string[];
}
