import type { User, UserRole } from "@prisma/client";

export type AuthUser = Omit<User, "passwordHash" | "refreshTokenHash">;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = AuthTokens & {
  user: AuthUser;
};

export type AuthActionTokenPurpose = "activation" | "password_reset" | "email_change";

export type AuthActionTokenPayload = {
  userId: string;
  purpose: AuthActionTokenPurpose;
};

export type RegisterInput = {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
};

export type LoginInput = {
  email?: string;
  phone?: string;
  password: string;
};

export type ContactInput = {
  email?: string;
  phone?: string;
};

export type RefreshInput = {
  refreshToken: string;
};

export type ResetPasswordInput = {
  password: string;
};

export type GooglePassportUser = {
  userId: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
};
