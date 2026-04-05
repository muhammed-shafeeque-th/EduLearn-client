import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import {
  CheckUsernameRequest,
  CheckUsernameResponse,
  InstructorMeta,
  RegisterInstructorPayload,
  User,
  UserInfo,
  UserMeta,
  UserProfileUpdatePayload,
} from '@/types/user';
import { CourseAnalytics } from '../course';
import { IUserDomainService, IUserService } from './interfaces/user.service.interface';
import {
  buildQueryParams,
  InstructorCoursesStats,
  InstructorStats,
  InstructorsStats,
  UsersParams,
  UsersStats,
} from './types/user.types';
import { getPaginationParams, WalletParams } from './types/wallet.types';
import { UserWallet, WalletTransaction } from '@/types/wallet';
import { Wishlist, WishlistItem } from '@/types/wishlist';
import { Cart, CartItem } from '@/types/cart';

export class UserService extends BaseService implements IUserDomainService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/users`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async getCurrentUser(options?: RequestOptions): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>('/me', options);
  }

  public getOnlineUsers(options?: RequestOptions): Promise<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>('/online', options);
  }

  public async updateUserProfile(
    data: Partial<UserProfileUpdatePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>('/me', data, options);
  }

  public async checkUsername(
    params: CheckUsernameRequest,
    options: RequestOptions = {}
  ): Promise<ApiResponse<CheckUsernameResponse>> {
    return this.get<ApiResponse<CheckUsernameResponse>>('/username-check', { ...options, params });
  }

  public async registerInstructor(
    credential: RegisterInstructorPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>, RegisterInstructorPayload>(
      '/instructors/register',
      credential,
      options
    );
  }

  public async getUsers(
    params: UsersParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<UserMeta[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return this.get<ApiResponse<UserMeta[]>>(queryString ? `?${queryString}` : '', options);
  }

  public async getStudentsOfInstructor(
    params: UsersParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<UserInfo[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return this.get<ApiResponse<UserInfo[]>>(
      `/me/students${queryString ? `?${queryString}` : ''}`,
      options
    );
  }

  public async getInstructorsOfStudent(
    params: UsersParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<UserInfo[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return this.get<ApiResponse<UserInfo[]>>(
      `/me/instructors${queryString ? `?${queryString}` : ''}`,
      options
    );
  }

  public async getInstructors(
    params: UsersParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorMeta[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return this.get<ApiResponse<InstructorMeta[]>>(
      queryString ? `/instructors?${queryString}` : '/instructors',
      options
    );
  }

  public async getInstructorCoursesStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorCoursesStats>> {
    return this.get<ApiResponse<InstructorCoursesStats>>(
      `/instructors/${instructorId}/courses/stats`,
      options
    );
  }

  public async getInstructorCourseStats(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(
      `/instructors/${instructorId}/courses/${courseId}/stats`,
      options
    );
  }

  public async getCourseAnalytics(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(
      `/instructors/${instructorId}/courses/${courseId}/stats`,
      options
    );
  }

  public async getInstructorStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorStats>> {
    return this.get<ApiResponse<InstructorStats>>(`/instructors/${instructorId}/stats`, options);
  }

  public async getInstructorsStats(
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorsStats>> {
    return this.get<ApiResponse<InstructorsStats>>(`/instructors/stats`, options);
  }

  public async getUsersStats(options?: RequestOptions): Promise<ApiResponse<UsersStats>> {
    return this.get<ApiResponse<UsersStats>>(`/stats`, options);
  }

  public async getUser(userId: string, options?: RequestOptions): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(`/${userId}`, options);
  }

  static create(serviceOptions: BaseServiceOptions): IUserService {
    return new UserService(serviceOptions);
  }

  // ==================================================================================================
  //                      CART
  // ==================================================================================================

  public async getCurrentUserCart(options?: RequestOptions): Promise<ApiResponse<Cart>> {
    return this.get<ApiResponse<Cart>>(`/me/carts`, options);
  }
  public async clearCart(options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/me/carts`, options);
  }
  public async getUserCart(userId: string, options?: RequestOptions): Promise<ApiResponse<Cart>> {
    return this.get<ApiResponse<Cart>>(`/${userId}/carts`, options);
  }

  public async addToCart(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CartItem>> {
    return this.post<ApiResponse<CartItem>>('/me/carts', { courseId }, options);
  }
  public async toggleCartItem(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CartItem>> {
    return this.post<ApiResponse<CartItem>>('/me/carts', { courseId }, options);
  }
  public async removeFromCart(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/carts?courseId=${courseId}`, options);
  }

  // ==================================================================================================
  //                      WISHLIST
  // ==================================================================================================

  public async getCurrentUserWishlist(options?: RequestOptions): Promise<ApiResponse<Wishlist>> {
    return this.get<ApiResponse<Wishlist>>(`/me/wishlists`, options);
  }
  public async getUserWishlist(
    userId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Wishlist>> {
    return this.get<ApiResponse<Wishlist>>(`/${userId}/wishlists`, options);
  }

  public async addToWishlist(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<WishlistItem>> {
    return this.post<ApiResponse<WishlistItem>>('/me/wishlists', { courseId }, options);
  }
  public async toggleWishlistItem(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<WishlistItem>> {
    return this.post<ApiResponse<WishlistItem>>('/me/wishlists', { courseId }, options);
  }
  public async removeFromWishlist(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/me/wishlists?courseId=${courseId}`, options);
  }

  // ==================================================================================================
  //                            WALLETS
  // ==================================================================================================

  public async getCurrentUserWallet(options?: RequestOptions): Promise<ApiResponse<UserWallet>> {
    return this.get<ApiResponse<UserWallet>>(`/me/wallets`, options);
  }

  public async getUserWallet(
    userId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<UserWallet>> {
    return this.get<ApiResponse<UserWallet>>(`/${userId}/wallets`, options);
  }

  public async getWalletTransactions(
    params?: WalletParams,
    options?: RequestOptions
  ): Promise<ApiResponse<WalletTransaction[]>> {
    const searchParams = getPaginationParams(params);
    const queryString = searchParams.toString();
    const url = `/me/wallets/transactions${queryString ? `?${queryString}` : ''}`;

    return this.get<ApiResponse<WalletTransaction[]>>(url, options);
  }
}

export const userService: IUserDomainService = new UserService();
