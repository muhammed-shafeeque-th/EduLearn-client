'use client';

import { useMessaging, type UseMessagingOptions } from './use-messaging';

/**
 * Convenience wrapper: calls `useMessaging` with `role: 'instructor'`.
 */
export function useInstructorMessaging(opts: Omit<UseMessagingOptions, 'role'> = {}) {
  return useMessaging({ ...opts, role: 'instructor' });
}
