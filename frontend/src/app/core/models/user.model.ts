export type MembershipTier = 'member' | 'bronze' | 'silver' | 'gold' | 'diamond';
export type UserRole = 'member' | 'admin';

export interface User {
  readonly userId: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly loyaltyPoints: number;
  readonly membershipTier: MembershipTier;
  readonly avatarUrl: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface Address {
  readonly addressId: string;
  readonly userId: string;
  readonly recipientName: string;
  readonly phone: string;
  readonly street: string;
  readonly district: string;
  readonly city: string;
  readonly isDefault: boolean;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface CreateAddressRequest {
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;
