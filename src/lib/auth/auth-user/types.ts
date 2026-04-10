import { UserRole } from '../auth-guard/types';

export type AuthPayload = {
  id: string;
  name: string;
  email?: string;
  roles: UserRole[];
  permissions: string[];
};
