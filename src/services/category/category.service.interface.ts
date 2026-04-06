import { ApiResponse } from '@/types/api-response';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category';
import { RequestOptions } from '../base-service';

export interface ICategoryService {
  getCategories(options?: RequestOptions): Promise<ApiResponse<Category[]>>;
  createCategory(
    data: CreateCategoryPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Category>>;
  updateCategory(
    id: string,
    data: UpdateCategoryPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Category>>;
  deleteCategory(id: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  toggleCategoryStatus(id: string, options?: RequestOptions): Promise<ApiResponse<Category>>;
}
