'use server';

import { cache } from 'react';
import { getErrorMessage } from '../utils';
import { serverUserService } from '@/services/server-service-clients';

/**
 * Fetches the currently authenticated user from the server.
 */
export const getCurrentUser = cache(async () => {
  try {
    const response = await serverUserService.getCurrentUser();

    if (response?.success && response.data) {
      return response.data;
    }

    if (!response.success) {
      console.warn('getCurrentUser: Unsuccessful response:', response.message);
    }

    return null;
  } catch (error) {
    console.error('getCurrentUser error:', getErrorMessage(error));
    return null;
  }
});
