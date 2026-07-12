import { Prisma } from "@prisma/client";
import { cloudinary } from "../../config/cloudinary";
import { prisma } from "../../config/database";
import { AppError } from "../../middlewares/errorHandler";
import type { BlogListQuery, BlogPostInput, UpdateBlogPostInput } from "./blog.types";

const MAX_BLOG_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const normalizeSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const resolveSlug = (input: Pick<BlogPostInput, "title" | "slug">) => {
  const slug = input.slug ?? normalizeSlug(input.title);
  if (!slug) {
    throw new AppError(400, "Blog slug is required");
  }
  return slug;
};

const estimateReadingTime = (content: string[]) => {
  const words = content.join(" ").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} phút đọc`;
};

const validateBlogImage = (file: Express.Multer.File) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "File tải lên phải là ảnh");
  }
  if (file.size > MAX_BLOG_IMAGE_SIZE_BYTES) {
    throw new AppError(400, "Ảnh phải nhỏ hơn hoặc bằng 5MB");
  }
};

const uploadBlogImage = (file: Express.Multer.File) =>
  new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "webee/blog", resource_type: "image" },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Blog image upload failed"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });

const uploadBlogImageWithValidation = async (file: Express.Multer.File) => {
  validateBlogImage(file);
  return uploadBlogImage(file);
};

type BlogFiles = {
  coverImage?: Express.Multer.File[];
  galleryImages?: Express.Multer.File[];
};

const mapBlogPersistenceError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(409, "Slug bài viết đã tồn tại");
  }
  throw error;
};

// ─── Public ──────────────────────────────────────────────────────────────────

export const getPublishedBlogPosts = async () =>
  prisma.blogPost.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: "desc" }
  });

export const getBlogPostBySlug = async (slug: string) => {
  const post = await prisma.blogPost.findFirst({
    where: { slug, isActive: true }
  });
  if (!post) {
    throw new AppError(404, "Không tìm thấy bài viết");
  }
  return post;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAdminBlogPosts = async (query: BlogListQuery) => {
  const where: Prisma.BlogPostWhereInput = {};
  if (query.isActive !== undefined) where.isActive = query.isActive;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } }
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [total, items] = await prisma.$transaction([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: query.limit
    })
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
};

export const createBlogPost = async (input: BlogPostInput, files: BlogFiles) => {
  const slug = resolveSlug(input);

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError(409, "Slug bài viết đã tồn tại");
  }

  const coverFile = files.coverImage?.[0];
  const coverImage = coverFile
    ? await uploadBlogImageWithValidation(coverFile)
    : input.coverImageUrl;
  if (!coverImage) {
    throw new AppError(400, "Vui lòng tải ảnh bìa cho bài viết");
  }

  const uploadedGallery = files.galleryImages
    ? await Promise.all(files.galleryImages.map(uploadBlogImageWithValidation))
    : [];
  const galleryImages = [...(input.galleryImageUrls ?? []), ...uploadedGallery];

  try {
    return await prisma.blogPost.create({
      data: {
        slug,
        title: input.title,
        excerpt: input.excerpt,
        coverImage,
        category: input.category,
        readingTime: input.readingTime || estimateReadingTime(input.content),
        content: input.content,
        galleryImages,
        isActive: input.isActive ?? true
      }
    });
  } catch (error) {
    mapBlogPersistenceError(error);
  }
};

export const updateBlogPost = async (
  postId: string,
  input: UpdateBlogPostInput,
  files: BlogFiles
) => {
  const existing = await prisma.blogPost.findUnique({ where: { postId } });
  if (!existing) {
    throw new AppError(404, "Không tìm thấy bài viết");
  }

  const coverFile = files.coverImage?.[0];
  const coverImage = coverFile
    ? await uploadBlogImageWithValidation(coverFile)
    : input.coverImageUrl;

  const uploadedGallery = files.galleryImages
    ? await Promise.all(files.galleryImages.map(uploadBlogImageWithValidation))
    : [];
  const galleryImages =
    input.galleryImageUrls !== undefined || uploadedGallery.length > 0
      ? [...(input.galleryImageUrls ?? []), ...uploadedGallery]
      : undefined;

  try {
    return await prisma.blogPost.update({
      where: { postId },
      data: {
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.readingTime !== undefined && { readingTime: input.readingTime }),
        ...(input.content !== undefined && { content: input.content }),
        ...(coverImage !== undefined && { coverImage }),
        ...(galleryImages !== undefined && { galleryImages }),
        ...(input.isActive !== undefined && { isActive: input.isActive })
      }
    });
  } catch (error) {
    mapBlogPersistenceError(error);
  }
};

export const toggleBlogPostStatus = async (postId: string) => {
  const post = await prisma.blogPost.findUnique({ where: { postId } });
  if (!post) {
    throw new AppError(404, "Không tìm thấy bài viết");
  }
  return prisma.blogPost.update({
    where: { postId },
    data: { isActive: !post.isActive }
  });
};

export const deleteBlogPost = async (postId: string) => {
  const post = await prisma.blogPost.findUnique({ where: { postId } });
  if (!post) {
    throw new AppError(404, "Không tìm thấy bài viết");
  }
  await prisma.blogPost.delete({ where: { postId } });
  return { message: "Đã xoá bài viết" };
};
