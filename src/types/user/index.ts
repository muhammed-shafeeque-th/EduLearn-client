export * from './payloads';

// export enum UserStatus {
//   VERIFIED = 'verified',
//   NOT_VERIFIED = 'not-verified',
//   ACTIVE = 'active',
//   NOT_ACTIVE = 'not-active',
//   BLOCKED = 'blocked',
// }

export type UserStatus = 'verified' | 'not-verified' | 'active' | 'not-active' | 'blocked';

export type UserRoles = 'student' | 'instructor' | 'admin';

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  bio?: string;
  phone?: string;
  country?: string;
  city?: string;
  gender?: string;
  preference?: string;
  language?: string;
  website?: string;
}

export interface UserSocials {
  provider: string;
  profileUrl: string;
  providerUserUrl?: string;
}

export interface InstructorProfile {
  bio: string;
  headline: string;
  joinedAt: string;
  experience?: string;
  certificate?: string;
  tags: string[];
  expertise: string;
  rating: number;
  totalRatings: number;
  totalCourses: number;
  totalStudents: number;
}

export type User =
  | {
      id: string;
      email: string;
      username: string;
      role: 'student';
      status: UserStatus;
      firstName: string;
      lastName?: string;
      avatar?: string;
      lastLoginAt?: string | undefined;
      profile?: UserProfile | undefined;
      socials?: UserSocials[];
      createdAt: string;
      updatedAt?: string;
      isOnline?: boolean;
    }
  | {
      id: string;
      email: string;
      username: string;
      role: 'instructor';
      status: UserStatus;
      firstName: string;
      lastName?: string;
      avatar?: string;
      lastLoginAt?: string | undefined;
      profile?: UserProfile | undefined;
      instructorProfile: InstructorProfile;
      socials?: UserSocials[];
      createdAt: string;
      updatedAt?: string;
      isOnline?: boolean;
    };

export type Instructor = Extract<User, { role: 'instructor' }>;

export type Student = Extract<User, { role: 'student' }>;

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor';
  isOnline?: boolean;
  lastSeen?: string;
}

export interface UserMeta {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatar: string;
  status: string;
  lastLogin: string;
  updatedAt: string;
  createdAt: string;
  city?: string | undefined;
  phone?: string | undefined;
  country?: string | undefined;
  bio?: string | undefined;
  gender?: string | undefined;
}

export interface InstructorMeta {
  id: string;
  email: string;
  role: string;
  username: string;
  slug: string;
  avatar: string;
  status: string;
  headline: string;
  expertise: string;
  tags: string[];
  rating: number;
  totalRatings: number;
  totalCourses: number;
  totalStudents: number;
  lastLogin: string;
  updatedAt: string;
  createdAt: string;
  language: string;
  website: string;
  bio: string;
  joinedAt: string;
  education: string;
  experience: string;
}
