import type { RequestHandler } from "express";
import {
  changePassword,
  createAddress,
  deleteAddress,
  getAddresses,
  getLoyaltyLogs,
  getLoyaltySummary,
  getProfile,
  updateAddress,
  updateProfile,
  uploadAvatar
} from "./users.service";
import type {
  AddressInput,
  ChangePasswordInput,
  LoyaltyLogsQuery,
  UpdateAddressInput,
  UpdateProfileInput
} from "./users.types";

export const getProfileController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getProfile(req.user?.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateProfileController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateProfile(req.user?.userId, req.body as UpdateProfileInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const uploadAvatarController: RequestHandler = async (req, res, next) => {
  try {
    const result = await uploadAvatar(req.user?.userId, req.file);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changePasswordController: RequestHandler = async (req, res, next) => {
  try {
    const result = await changePassword(req.user?.userId, req.body as ChangePasswordInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAddressesController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getAddresses(req.user?.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createAddressController: RequestHandler = async (req, res, next) => {
  try {
    const result = await createAddress(req.user?.userId, req.body as AddressInput);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAddressController: RequestHandler = async (req, res, next) => {
  try {
    const result = await updateAddress(
      req.user?.userId,
      req.params.id,
      req.body as UpdateAddressInput
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAddressController: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteAddress(req.user?.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getLoyaltySummaryController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getLoyaltySummary(req.user?.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyLogsController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getLoyaltyLogs(req.user?.userId, req.query as unknown as LoyaltyLogsQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
