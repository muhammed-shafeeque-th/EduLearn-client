import { RequestOptions } from '../base-service';
import { ApiResponse } from '@/types/api-response';
import { LoginCredentials } from '@/types/auth';
import { Auth2SignData, AuthResponse, OAuthResponse, RegisterData } from '@/types/auth';

import {
  CheckEmailRequest,
  CheckEmailResponse,
  PasswordResetRequest,
  ResendOTPRequest,
  VerifyOTPRequest,
} from '@/types/auth';

export interface IAuthService {
  login(
    credentials: LoginCredentials,
    options?: RequestOptions
  ): Promise<ApiResponse<AuthResponse>>;
  register(
    userdata: RegisterData,
    options?: RequestOptions
  ): Promise<ApiResponse<{ userId: string }>>;
  oauthSign(userdata: Auth2SignData, options?: RequestOptions): Promise<ApiResponse<OAuthResponse>>;
  verify(
    verifyData: VerifyOTPRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<AuthResponse>>;
  resendOtp(
    resendData: ResendOTPRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<AuthResponse>>;
  refreshToken(options?: RequestOptions): Promise<ApiResponse<AuthResponse>>;
  logout(options?: RequestOptions): Promise<ApiResponse<void>>;
  forgotPassword(
    email: string,
    options?: RequestOptions
  ): Promise<ApiResponse<{ message: string }>>;
  resetPassword(
    data: PasswordResetRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<{ message: string }>>;

  checkEmail(
    params: CheckEmailRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<CheckEmailResponse>>;
}
