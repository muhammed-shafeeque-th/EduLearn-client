import { Gender, UserSocials } from '.';

export interface RegisterInstructorPayload {
  username: string;
  tags: string[];
  expertise: string;
  experience: string;
  education: string;
  language: string;
  headline: string;
  biography: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  receiveUpdates?: boolean | undefined;
}

export interface UserProfileUpdatePayload {
  firstName: string;
  lastName?: string;
  biography?: string;
  language?: string;
  socials?: UserSocials[];
  city?: string;
  country?: string;
  phone?: string;
  avatar?: string;
  gender?: Gender;
}

export interface CheckUsernameRequest {
  username: string;
}
export interface CheckUsernameResponse {
  exists: boolean;
  message?: string;
}
