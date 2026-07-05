import type { User } from './user.model';

// Local accounts authenticate with phone + password; email accounts go
// through Google OAuth instead.
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface RegisterResponse {
  message: string;
  requiresOtp?: boolean;
  smsDelivered?: boolean;
  /** Present outside production only — lets the OTP flow be tested without SMS. */
  devOtp?: string;
}

export interface ForgotPasswordRequest {
  phone: string;
}

/** Field name must match backend resetPasswordBodySchema (`password`). */
export interface ResetPasswordRequest {
  password: string;
}
