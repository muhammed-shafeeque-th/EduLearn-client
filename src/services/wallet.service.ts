import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { UserWallet, WalletTransaction } from '@/types/wallet';

export interface WalletParams {
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

function getPaginationParams(params?: WalletParams | Partial<WalletParams>): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');

  return searchParams;
}

export interface IWalletService {
  getUserWallet(userId: string, options?: RequestOptions): Promise<ApiResponse<UserWallet>>;
  getCurrentUserWallet(options?: RequestOptions): Promise<ApiResponse<UserWallet>>;
  getWalletTransactions(
    params?: WalletParams,
    options?: RequestOptions
  ): Promise<ApiResponse<WalletTransaction[]>>;
}

export class WalletService extends BaseService implements IWalletService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/wallets`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async getCurrentUserWallet(options?: RequestOptions): Promise<ApiResponse<UserWallet>> {
    return this.get<ApiResponse<UserWallet>>(`/me`, options);
  }

  public async getUserWallet(
    userId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<UserWallet>> {
    return this.get<ApiResponse<UserWallet>>(`/${userId}`, options);
  }

  public async getWalletTransactions(
    params?: WalletParams,
    options?: RequestOptions
  ): Promise<ApiResponse<WalletTransaction[]>> {
    const searchParams = getPaginationParams(params);
    const queryString = searchParams.toString();
    const url = `/transactions${queryString ? `?${queryString}` : ''}`;

    return this.get<ApiResponse<WalletTransaction[]>>(url, options);
  }

  static create(serviceOptions: BaseServiceOptions) {
    return new WalletService(serviceOptions);
  }
}

// Singleton for client-side usage
export const walletService: IWalletService = new WalletService();
