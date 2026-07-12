import type { RequestHandler } from "express";
import {
  confirmEmailChange,
  changePassword,
  createAddress,
  deactivateAccount,
  deleteAddress,
  getAddresses,
  getAdminCustomerDetail,
  getAdminCustomers,
  getLoyaltyLogs,
  getLoyaltySummary,
  getProfile,
  redeemLoyaltyReward,
  requestEmailChange,
  requestPhoneChange,
  updateAddress,
  updateProfile,
  uploadAvatar,
  verifyPhoneChange
} from "./users.service";
import type {
  AddressInput,
  AdminCustomersQuery,
  ChangeEmailInput,
  ChangePasswordInput,
  ChangePhoneInput,
  ConfirmEmailChangeInput,
  LoyaltyLogsQuery,
  RedeemRewardInput,
  UpdateAddressInput,
  UpdateProfileInput,
  VerifyPhoneChangeInput
} from "./users.types";

export const getProfileController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getProfile(req.user?.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminCustomersController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getAdminCustomers(req.query as unknown as AdminCustomersQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminCustomerDetailController: RequestHandler = async (req, res, next) => {
  try {
    const result = await getAdminCustomerDetail(req.params.id);
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

export const requestPhoneChangeController: RequestHandler = async (req, res, next) => {
  try {
    const result = await requestPhoneChange(req.user?.userId, req.body as ChangePhoneInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyPhoneChangeController: RequestHandler = async (req, res, next) => {
  try {
    const result = await verifyPhoneChange(req.user?.userId, req.body as VerifyPhoneChangeInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const requestEmailChangeController: RequestHandler = async (req, res, next) => {
  try {
    const result = await requestEmailChange(req.user?.userId, req.body as ChangeEmailInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const confirmEmailChangeController: RequestHandler = async (req, res, next) => {
  try {
    const result = await confirmEmailChange(req.body as ConfirmEmailChangeInput);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deactivateAccountController: RequestHandler = async (req, res, next) => {
  try {
    const result = await deactivateAccount(req.user?.userId);
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

export const redeemRewardController: RequestHandler = async (req, res, next) => {
  try {
    const result = await redeemLoyaltyReward(
      req.user?.userId,
      req.body as RedeemRewardInput
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
