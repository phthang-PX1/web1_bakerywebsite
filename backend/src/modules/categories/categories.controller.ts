import type { RequestHandler } from "express";
import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  toggleCategoryStatus,
  updateCategory
} from "./categories.service";
import type { CategoryInput, UpdateCategoryInput } from "./categories.types";

export const getCategoriesController: RequestHandler = async (_req, res, next) => {
  try {
    const result = await getCategories();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlugController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getCategoryBySlug(req.params.slug);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createCategoryController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createCategory(req.body as CategoryInput, req.file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateCategory(req.params.id, req.body as UpdateCategoryInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleCategoryStatusController: RequestHandler = async (req, res, next) => {
  try {
    const result = await toggleCategoryStatus(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
