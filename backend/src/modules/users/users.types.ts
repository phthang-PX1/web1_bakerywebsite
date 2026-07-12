import type { Address, MembershipTier, User } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash" | "refreshTokenHash">;

export type UpdateProfileInput = {
  fullName?: string;
};

export type ChangeEmailInput = {
  email: string;
};

export type ChangePhoneInput = {
  phone: string;
};

export type VerifyPhoneChangeInput = {
  otp: string;
};

export type ConfirmEmailChangeInput = {
  token: string;
};

export type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
};

export type AddressInput = {
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<AddressInput>;

export type LoyaltySummary = {
  loyaltyPoints: number;
  membershipTier: MembershipTier;
};

export type LoyaltyLogsQuery = {
  page: number;
  limit: number;
};

export type RedeemRewardInput = {
  rewardId: string;
};

export type AddressResponse = Address;

export type AdminCustomersQuery = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
};

export type AdminCustomerListItem = SafeUser & {
  totalOrders: number;
  totalSpent: number;
};
