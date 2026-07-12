export type BlogPostInput = {
  slug?: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime?: string;
  content: string[];
  coverImageUrl?: string;
  galleryImageUrls?: string[];
  isActive?: boolean;
};

export type UpdateBlogPostInput = Partial<BlogPostInput>;

export type BlogListQuery = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
};
