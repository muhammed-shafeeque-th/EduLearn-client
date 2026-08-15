import { UserRole } from '@/types/auth';

export type AuthPayload = {
  id: string;
  name: string;
  email?: string;
  roles: UserRole[];
  permissions: string[];
};
