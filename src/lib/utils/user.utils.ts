import { UserRole } from '@/types/auth';

export function getUserRole<T extends { roles: UserRole[] }>(user: T | null): UserRole | null {
  if (!user) return null;
  if (user.roles.includes('admin')) return 'admin';
  if (user.roles.includes('instructor')) return 'instructor';
  if (user.roles.includes('student')) return 'student';
  return null;
}
