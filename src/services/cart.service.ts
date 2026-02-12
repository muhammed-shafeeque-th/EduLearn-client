import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { Cart, CartItem } from '@/types/cart';

export interface ICartService {
  getUserCart(userId: string, options?: RequestOptions): Promise<ApiResponse<Cart>>;
  getCurrentUserCart(options?: RequestOptions): Promise<ApiResponse<Cart>>;
  clearCart(options?: RequestOptions): Promise<ApiResponse<void>>;
  addToCart(courseId: string, options?: RequestOptions): Promise<ApiResponse<CartItem>>;
  toggleCartItem(courseId: string, options?: RequestOptions): Promise<ApiResponse<CartItem>>;
  removeFromCart(courseId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
}

export class CartService extends BaseService implements ICartService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/carts`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async getCurrentUserCart(options?: RequestOptions): Promise<ApiResponse<Cart>> {
    return this.get<ApiResponse<Cart>>(`/me`, options);
  }
  public async clearCart(options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/me`, options);
  }
  public async getUserCart(userId: string, options?: RequestOptions): Promise<ApiResponse<Cart>> {
    return this.get<ApiResponse<Cart>>(`/${userId}`, options);
  }

  public async addToCart(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CartItem>> {
    return this.post<ApiResponse<CartItem>>('/me', { courseId }, options);
  }
  public async toggleCartItem(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CartItem>> {
    return this.post<ApiResponse<CartItem>>('/me', { courseId }, options);
  }
  public async removeFromCart(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`?courseId=${courseId}`, options);
  }

  // Static factory for SSR usage (pass a token getter or headers)
  static create(serviceOptions: BaseServiceOptions) {
    return new CartService(serviceOptions);
  }
}

// Singleton for client-side usage
export const cartService: ICartService = new CartService();
