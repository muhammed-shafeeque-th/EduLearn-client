'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category';
import { adminService } from '@/services/admin';

//  MUTATIONS

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
};

/**
 * Create a new category (admin only).
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => adminService.createCategory(payload),
    onSuccess: () => invalidateAll(queryClient),
    meta: {
      successMessage: 'Category created successfully!',
      errorMessage: 'Failed to create category',
    },
  });
}

/**
 * Update an existing category (admin only).
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      adminService.updateCategory(id, data),
    onSuccess: () => invalidateAll(queryClient),
    meta: {
      successMessage: 'Category updated successfully!',
      errorMessage: 'Failed to update category',
    },
  });
}

/**
 * Toggle a category's active/inactive status (admin only).
 */
export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.toggleCategoryStatus(id),
    onSuccess: () => invalidateAll(queryClient),
    meta: {
      successMessage: 'Category status updated!',
      errorMessage: 'Failed to update category status',
    },
  });
}

/**
 * Soft-delete a category (admin only).
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => invalidateAll(queryClient),
    meta: {
      successMessage: 'Category deleted successfully!',
      errorMessage: 'Failed to delete category',
    },
  });
}

/**
 * Restore a soft-deleted category by re-activating it via toggle-status.
 * The backend toggles isActive & clears deletedAt for soft-deleted categories.
 */
export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.toggleCategoryStatus(id),
    onSuccess: () => invalidateAll(queryClient),
    meta: {
      successMessage: 'Category restored successfully!',
      errorMessage: 'Failed to restore category',
    },
  });
}
