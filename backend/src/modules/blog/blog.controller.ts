import type { RequestHandler } from "express";
import {
  createBlogPost,
  deleteBlogPost,
  getAdminBlogPosts,
  getBlogPostBySlug,
  getPublishedBlogPosts,
  toggleBlogPostStatus,
  updateBlogPost
} from "./blog.service";
import type { BlogListQuery, BlogPostInput, UpdateBlogPostInput } from "./blog.types";

type BlogFiles = {
  coverImage?: Express.Multer.File[];
  galleryImages?: Express.Multer.File[];
};

export const getPublishedBlogPostsController: RequestHandler = async (_req, res, next) => {
  try {
    const result = await getPublishedBlogPosts();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getBlogPostBySlugController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getBlogPostBySlug(req.params.slug);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminBlogPostsController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getAdminBlogPosts(req.query as unknown as BlogListQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createBlogPostController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createBlogPost(
      req.body as BlogPostInput,
      (req.files as BlogFiles) ?? {}
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateBlogPostController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateBlogPost(
      req.params.id,
      req.body as UpdateBlogPostInput,
      (req.files as BlogFiles) ?? {}
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleBlogPostStatusController: RequestHandler = async (req, res, next) => {
  try {
    const result = await toggleBlogPostStatus(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPostController: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteBlogPost(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
