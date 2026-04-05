import { RequestOptions } from '../../base-service';
import { ApiResponse } from '@/types/api-response';
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
