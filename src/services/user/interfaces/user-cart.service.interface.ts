import { RequestOptions } from '../../base-service';
import { ApiResponse } from '@/types/api-response';
import { Cart, CartItem } from '@/types/cart';

export interface ICartService {
  getUserCart(userId: string, options?: RequestOptions): Promise<ApiResponse<Cart>>;
  getCurrentUserCart(options?: RequestOptions): Promise<ApiResponse<Cart>>;
  clearCart(options?: RequestOptions): Promise<ApiResponse<void>>;
  addToCart(courseId: string, options?: RequestOptions): Promise<ApiResponse<CartItem>>;
  toggleCartItem(courseId: string, options?: RequestOptions): Promise<ApiResponse<CartItem>>;
  removeFromCart(courseId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
}
