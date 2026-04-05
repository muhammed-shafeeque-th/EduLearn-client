import { RequestOptions } from '../../base-service';
import { ApiResponse } from '@/types/api-response';
import { UserWallet, WalletTransaction } from '@/types/wallet';
import { WalletParams } from '../types/wallet.types';

export interface IWalletService {
  getUserWallet(userId: string, options?: RequestOptions): Promise<ApiResponse<UserWallet>>;
  getCurrentUserWallet(options?: RequestOptions): Promise<ApiResponse<UserWallet>>;
  getWalletTransactions(
    params?: WalletParams,
    options?: RequestOptions
  ): Promise<ApiResponse<WalletTransaction[]>>;
}
