// Auth Service - Handles all authentication-related API interactions and token management

// -------------------- Imports --------------------
import { config } from '@/lib/config';
import { store } from '@/states/client';
import { refreshToken } from '@/states/client/slices/auth-slice';
import { logout as logoutAction } from '@/states/client/slices/auth-slice';

import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';

import { ApiResponse } from '@/types/api-response';

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
import { AxiosResponse } from 'axios';

//  Types & Interface

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
  changePassword(
    data: PasswordChangeRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<{ message: string }>>;
  checkEmail(
    params: CheckEmailRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<CheckEmailResponse>>;
}

// -------------------- Token Utilities --------------------

// Safely gets the current auth token from the Redux store state (client-side)
const getClientToken = () => store?.getState()?.auth?.token ?? null;

// Handles automatic refresh of token using Redux's refreshToken, throws if unsuccessful
const authClientRefresh = async () => {
  const response = await store.dispatch(refreshToken());
  if (
    response.meta.requestStatus === 'rejected' ||
    !(response.payload as { success: boolean; message: string })?.success
  ) {
    throw new Error((response.payload as { success: boolean; message: string })?.message);
  }

  return { token: (response.payload as { data: { token: string } })?.data?.token };
};

// Response Hook: If user got blocked (403), trigger a logout request to clear user data
const onResponseHook = (response: AxiosResponse) => {
  if (response.status === 403) {
    // Optionally: you might want to check if already logged out, but safe to dispatch logout
    store.dispatch(logoutAction());
  }
};

// -------------------- Auth Service Implementation --------------------

export class AuthService extends BaseService implements IAuthService {
  constructor({
    getToken = getClientToken,
    authRefresh = authClientRefresh,
    hooks,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/auth`, {
      ...options,
      getToken,
      authRefresh,
      hooks: {
        ...(hooks || {}),
        onResponse: (response: AxiosResponse) => {
          onResponseHook(response);
          if (hooks && typeof hooks.onResponse === 'function') {
            hooks.onResponse(response);
          }
        },
      },
    });
  }

  // --- Authentication Methods ---

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

  // Static factory for SSR usage (pass a token getter or headers)
  static create(serviceOptions: BaseServiceOptions) {
    return new AuthService(serviceOptions);
  }
}

// -------------------- Client-side Singleton Instance --------------------
export const authService: IAuthService = new AuthService({});
