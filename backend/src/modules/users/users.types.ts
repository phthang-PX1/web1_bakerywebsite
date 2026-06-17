import type { Address, MembershipTier, User } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash" | "refreshTokenHash">;

export type UpdateProfileInput = {
  fullName?: string;
  phone?: string | null;
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

export type AddressResponse = Address;
