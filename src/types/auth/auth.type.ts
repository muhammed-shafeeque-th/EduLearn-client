export interface AuthUser {
  id?: string;
  userId: string;
  email: string;
  username: string;
  roles: UserRole[];
  avatar?: string;
}

export enum AuthType {
  EMAIL = 'email',
  OAUTH = 'oauth',
}
export type AuthProvider = 'google' | 'facebook' | 'github';

export type UserRole = 'student' | 'instructor' | 'admin';
