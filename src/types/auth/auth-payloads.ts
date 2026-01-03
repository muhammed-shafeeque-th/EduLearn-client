import { AuthProvider, AuthType, UserRoles } from './auth.type';

export interface LoginCredentials {
  email: string;
  password?: string;
  authType: AuthType;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRoles;
  password?: string;
  confirmPassword: string;
  avatar?: string;
  authType: AuthType;
}
export interface Auth2SignData {
  token: string;
  provider: AuthProvider;
  authType: AuthType;
}

export interface PasswordResetRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOTPRequest {
  code: string;
  email: string;
  username?: string;
  userId?: string;
}
export interface LogoutCredential {
  userId: string;
}
export interface ResendOTPRequest {
  email: string;
  username?: string;
  userId?: string;
}
export interface CheckEmailRequest {
  email: string;
}

export type PasswordChangeRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export interface ChangePasswordPayload {
  userId: string;
  oldPassword: string;
  newPassword: string;
}
