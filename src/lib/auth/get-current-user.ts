'use server';

import { cache } from 'react';
import { getErrorMessage } from '../utils';
import { serverUserService } from '@/services/server-service-clients';

/**
 * Fetches the currently authenticated user from the server.
 * Returns `null` if the user is not authenticated or an error occurs.
 *
 * Uses React's `cache` for memoization in server actions.
 */
export const getCurrentUser = cache(async () => {
  try {
    const response = await serverUserService.getCurrentUser();

    if (response?.success && response.data) {
      return response.data;
    }

    // Optionally: log or handle unsuccessful response
    if (!response.success) {
      console.warn('getCurrentUser: Unsuccessful response:', response.message);
    }

    return null;
  } catch (error) {
    // Prefer error logging with context and without blocking user experience
    console.error('getCurrentUser error:', getErrorMessage(error));
    return null;
  }
});
