import { UserRole } from '../require-auth/types';

export type AuthPayload = {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
};
