import type { RequestHandler } from "express";
import {
  createBanner,
  deleteBanner,
  getActiveBanners,
  getAllBanners,
  toggleBannerStatus,
  updateBanner
} from "./banners.service";
import type { CreateBannerInput, UpdateBannerInput } from "./banners.schema";

export const getBannersController: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json(await getActiveBanners());
  } catch (error) {
    next(error);
  }
};

export const getAdminBannersController: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json(await getAllBanners());
  } catch (error) {
    next(error);
  }
};

export const createBannerController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createBanner(req.body as CreateBannerInput, req.file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateBannerController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateBanner(
      req.params.id,
      req.body as UpdateBannerInput,
      req.file
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleBannerStatusController: RequestHandler = async (req, res, next) => {
  try {
    res.status(200).json(await toggleBannerStatus(req.params.id));
  } catch (error) {
    next(error);
  }
};

export const deleteBannerController: RequestHandler = async (req, res, next) => {
  try {
    res.status(200).json(await deleteBanner(req.params.id));
  } catch (error) {
    next(error);
  }
};
