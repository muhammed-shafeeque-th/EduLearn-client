import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { Wishlist, WishlistItem } from '@/types/wishlist';

export interface IWishlistService {
  getUserWishlist(userId: string, options?: RequestOptions): Promise<ApiResponse<Wishlist>>;
  getCurrentUserWishlist(options?: RequestOptions): Promise<ApiResponse<Wishlist>>;
  addToWishlist(courseId: string, options?: RequestOptions): Promise<ApiResponse<WishlistItem>>;
  toggleWishlistItem(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<WishlistItem>>;
  removeFromWishlist(courseId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
}

export class WishlistService extends BaseService implements IWishlistService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/wishlists`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async getCurrentUserWishlist(options?: RequestOptions): Promise<ApiResponse<Wishlist>> {
    return this.get<ApiResponse<Wishlist>>(`/me`, options);
  }
  public async getUserWishlist(
    userId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Wishlist>> {
    return this.get<ApiResponse<Wishlist>>(`/${userId}`, options);
  }

  public async addToWishlist(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<WishlistItem>> {
    return this.post<ApiResponse<WishlistItem>>('/me', { courseId }, options);
  }
  public async toggleWishlistItem(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<WishlistItem>> {
    return this.post<ApiResponse<WishlistItem>>('/me', { courseId }, options);
  }
  public async removeFromWishlist(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/?courseId=${courseId}`, options);
  }

  // Static factory for SSR usage (pass a token getter or headers)
  static create(options: BaseServiceOptions) {
    return new WishlistService(options);
  }
}

// Singleton for client-side usage
export const wishlistService: IWishlistService = new WishlistService();
