import { RequestOptions } from '../../base-service';
import { ApiResponse } from '@/types/api-response';
import {
  CheckUsernameRequest,
  CheckUsernameResponse,
  User,
  UserInfo,
  UserMeta,
  UserProfileUpdatePayload,
} from '@/types/user';
import { UsersParams, UsersStats } from '../types/user.types';
import { IWishlistService } from './user-wishlist.service.interface';
import { ICartService } from './user-cart.service.interface';
import { IWalletService } from './user-wallet.service.interface';

export interface IUserService {
  getCurrentUser(options?: RequestOptions): Promise<ApiResponse<User>>;
  updateUserProfile(
    data: Partial<UserProfileUpdatePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<User>>;
  getUsers(params?: UsersParams, options?: RequestOptions): Promise<ApiResponse<UserMeta[]>>;
  getInstructorsOfStudent(
    params?: UsersParams,
    options?: RequestOptions
  ): Promise<ApiResponse<UserInfo[]>>;
  getUsersStats(options?: RequestOptions): Promise<ApiResponse<UsersStats>>;

  getUser(userId: string, options?: RequestOptions): Promise<ApiResponse<User>>;
  checkUsername(
    params: CheckUsernameRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<CheckUsernameResponse>>;

  getOnlineUsers(options?: RequestOptions): Promise<ApiResponse<string[]>>;
}

export interface IUserDomainService
  extends IUserService,
    IWishlistService,
    ICartService,
    IWalletService {}
