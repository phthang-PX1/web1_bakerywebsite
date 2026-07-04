import type { RequestHandler } from "express";
import {
  addProductImages,
  createProduct,
  deleteProductImage,
  getProductById,
  getProductBySlug,
  getProductReviews,
  getProducts,
  toggleProductStatus,
  updateProduct
} from "./products.service";
import type {
  ProductInput,
  ProductListQuery,
  ProductReviewsQuery,
  UpdateProductInput
} from "./products.types";

type ProductUploadFiles = {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
};

export const getProductsController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getProducts(req.query as unknown as ProductListQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getProductBySlug(req.params.slug);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductReviewsController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getProductReviews(
      req.params.id,
      req.query as unknown as ProductReviewsQuery
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminProductsController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getProducts(req.query as unknown as ProductListQuery, {
      includeInactive: true
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminProductByIdController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getProductById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createProductController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createProduct(
      req.body as ProductInput,
      (req.files as ProductUploadFiles | undefined) ?? {}
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateProductController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateProduct(req.params.id, req.body as UpdateProductInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleProductStatusController: RequestHandler = async (req, res, next) => {
  try {
    const result = await toggleProductStatus(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const addProductImagesController: RequestHandler = async (req, res, next) => {
  try {
    const result = await addProductImages(req.params.id, req.files as Express.Multer.File[]);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteProductImageController: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteProductImage(req.params.id, req.params.imageId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
