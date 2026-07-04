import type { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

/** Field name must match backend resetPasswordBodySchema (`password`). */
export interface ResetPasswordRequest {
  password: string;
}
