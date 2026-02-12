export interface AuthUser {
  id?: string;
  userId: string;
  email: string;
  username: string;
  role: UserRoles;
  avatar?: string;
}

export enum AuthType {
  EMAIL = 'email',
  OAUTH = 'oauth',
}
export type AuthProvider = 'google' | 'facebook' | 'github';

export type UserRoles = 'student' | 'instructor' | 'admin';
