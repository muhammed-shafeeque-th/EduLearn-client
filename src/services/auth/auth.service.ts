import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { LoginCredentials } from '@/types/auth';
import { Auth2SignData, AuthResponse, OAuthResponse, RegisterData } from '@/types/auth';

import {
  CheckEmailRequest,
  CheckEmailResponse,
  PasswordChangeRequest,
  PasswordResetRequest,
  ResendOTPRequest,
  VerifyOTPRequest,
} from '@/types/auth';
import { IAuthService } from './auth.service.interface';

export class AuthService extends BaseService implements IAuthService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    hooks,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/auth`, {
      ...options,
      getToken,
      authRefresh,
      hooks,
    });
  }

  login(
    credentials: LoginCredentials,
    options?: RequestOptions
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>, LoginCredentials>('/login', credentials, options);
  }

  register(
    userdata: RegisterData,
    options?: RequestOptions
  ): Promise<ApiResponse<{ userId: string }>> {
    return this.post<ApiResponse<{ userId: string }>, RegisterData>('/register', userdata, options);
  }

  oauthSign(
    userdata: Auth2SignData,
    options?: RequestOptions
  ): Promise<ApiResponse<OAuthResponse>> {
    return this.post<ApiResponse<OAuthResponse>, Auth2SignData>('/oauth', userdata, options);
  }

  checkEmail(
    params: CheckEmailRequest,
    options: RequestOptions = {}
  ): Promise<ApiResponse<CheckEmailResponse>> {
    return this.get<ApiResponse<CheckEmailResponse>>('/email-check', { ...options, params });
  }

  verify(
    verifyData: VerifyOTPRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>, VerifyOTPRequest>('/verify', verifyData, options);
  }

  resendOtp(
    resendData: ResendOTPRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>, ResendOTPRequest>(
      '/resend-otp',
      resendData,
      options
    );
  }

  logout(options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/logout', {}, options);
  }

  forgotPassword(
    email: string,
    options?: RequestOptions
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>('/forgot-password', { email }, options);
  }

  resetPassword(
    data: PasswordResetRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>('/reset-password', data, options);
  }

  changePassword(
    data: PasswordChangeRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<ApiResponse<{ message: string }>>('/change-password', data, options);
  }

  refreshToken(options?: RequestOptions): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>>('/refresh', options);
  }

  static create(serviceOptions: BaseServiceOptions) {
    return new AuthService(serviceOptions);
  }
}

export const authService: IAuthService = new AuthService();
