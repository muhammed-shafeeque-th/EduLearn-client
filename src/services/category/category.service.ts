import { ApiResponse } from '@/types/api-response';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category';
import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { ICategoryService } from './category.service.interface';

/**
 * CategoryService – consumes the /courses/categories REST endpoints exposed by the API Gateway.
 * Reads are public (no auth needed); writes are admin-only (token injected automatically).
 */
export class CategoryService extends BaseService implements ICategoryService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/courses/categories`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  /** GET /courses/categories – list all categories (public, cached) */
  async getCategories(options?: RequestOptions): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>('', options);
  }

  /** POST /courses/categories – create a new category (admin) */
  async createCategory(
    data: CreateCategoryPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Category>> {
    return this.post<ApiResponse<Category>>('', data, options);
  }

  /** PATCH /courses/categories/:id – update a category (admin) */
  async updateCategory(
    id: string,
    data: UpdateCategoryPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Category>> {
    return this.patch<ApiResponse<Category>>(`/${id}`, data, options);
  }

  /** DELETE /courses/categories/:id – soft-delete a category (admin) */
  async deleteCategory(id: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/${id}`, options);
  }

  /** PATCH /courses/categories/:id/toggle-status – activate or deactivate (admin) */
  async toggleCategoryStatus(id: string, options?: RequestOptions): Promise<ApiResponse<Category>> {
    return this.patch<ApiResponse<Category>>(`/${id}/toggle-status`, {}, options);
  }

  static create(serviceOptions: BaseServiceOptions) {
    return new CategoryService(serviceOptions);
  }
}

export const categoryService: ICategoryService = new CategoryService();
