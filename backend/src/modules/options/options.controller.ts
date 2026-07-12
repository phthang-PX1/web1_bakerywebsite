import type { RequestHandler } from "express";
import {
  createOptionGroup,
  createOptionItem,
  createSharedOptionGroup,
  deleteOptionGroup,
  getAdminOptionGroups,
  getProductOptions,
  getSharedOptions,
  toggleOptionItemStatus,
  updateOptionGroup,
  updateOptionItem
} from "./options.service";
import type {
  OptionGroupInput,
  OptionItemInput,
  UpdateOptionGroupInput,
  UpdateOptionItemInput
} from "./options.types";

export const getProductOptionsController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getProductOptions(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSharedOptionsController: RequestHandler = async (_req, res, next) => {
  try {
    const result = await getSharedOptions();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminOptionGroupsController: RequestHandler = async (req, res, next) => {
  try {
    const productId = typeof req.query.productId === "string" ? req.query.productId : undefined;
    const result = await getAdminOptionGroups(productId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createSharedOptionGroupController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createSharedOptionGroup(req.body as OptionGroupInput);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const createOptionGroupController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createOptionGroup(
      req.params.id,
      req.body as OptionGroupInput
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateOptionGroupController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateOptionGroup(
      req.params.id,
      req.body as UpdateOptionGroupInput
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteOptionGroupController: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteOptionGroup(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createOptionItemController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createOptionItem(
      req.params.id,
      req.body as OptionItemInput,
      req.file
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateOptionItemController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateOptionItem(
      req.params.id,
      req.body as UpdateOptionItemInput,
      req.file
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const toggleOptionItemStatusController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await toggleOptionItemStatus(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
