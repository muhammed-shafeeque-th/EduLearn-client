import { z } from 'zod';

export const instructorRegistrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(1, 'Please select your country'),
  city: z.string().min(2, 'City must be at least 2 characters'),

  // Professional Information
  expertise: z.string().min(1, 'Please select your expertise area'),
  experience: z.string().min(1, 'Please select your experience level'),
  education: z.string().min(1, 'Please select your education level'),
  language: z.string().min(1, 'Please select your language'),
  headline: z.string().min(1, 'Please enter appropriate headlines'),
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(500, 'Bio must be less than 500 characters'),

  // Credentials
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  facebookUrl: z.string().url('Please enter a valid Facebook URL').optional().or(z.literal('')),
  instagramUrl: z.string().url('Please enter a valid Instagram URL').optional().or(z.literal('')),

  // Agreement
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
  agreeToPrivacy: z.boolean().refine((val) => val === true, 'You must agree to the privacy policy'),
  receiveUpdates: z.boolean().optional(),
});

export const personalInfoSchema = z.object({
  // Username (as first name, but field name is `username`)
  username: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name must be less than 50 characters' })
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, {
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
    }),

  // Professional Headline
  headline: z
    .string()
    .min(10, { message: 'Headline must be at least 10 characters' })
    .max(120, { message: 'Headline must be less than 120 characters' })
    .trim()
    .refine((val) => val.length > 0 && !/^\s*$/.test(val), {
      message: 'Headline cannot be empty or contain only whitespace',
    }),

  // Professional Biography
  biography: z
    .string()
    .min(50, { message: 'Bio must be at least 50 characters' })
    .max(2000, { message: 'Bio must be less than 2000 characters' })
    .refine((val) => val.trim().length >= 50, {
      message: 'Bio must be at least 50 characters (excluding whitespace)',
    }),

  // Tags / Skills
  tags: z
    .array(z.string().min(1, { message: 'Tag cannot be empty' }))
    .min(1, { message: 'Please select at least one skill or tag' })
    .max(30, { message: 'You can select up to 30 skills or tags maximum' }),
});

// export const ProfessionalInfoSchema = z.object({
//   expertise: z.string().min(1, 'Please select your area of expertise'),
//   experience: z.string().min(1, 'Please select your teaching experience'),
//   education: z.string().min(1, 'Please select your education level'),
//   language: z.string().min(1, 'Please select your language'),
//   instructorTags: z.array(z.string()).min(1, 'Please select at least one skill/tag'),
//   // headline: z.string().min(1, 'Headline is required'),
//   // bio: z.string().min(50, 'Bio must be at least 50 characters'),
// });

export const professionalInfoSchema = z.object({
  expertise: z
    .string()
    .min(1, 'Please select your expertise area')
    .max(100, 'Expertise must be less than 100 characters'),
  experience: z
    .string()
    .min(1, 'Please select your experience level')
    .max(50, 'Experience must be less than 50 characters'),
  education: z
    .string()
    .min(1, 'Please select your education level')
    .max(100, 'Education must be less than 100 characters'),
  language: z
    .string()
    .min(1, 'Please select your language')
    .max(50, 'Language must be less than 50 characters'),
  // headline: z
  //   .string()
  //   .min(1, 'Please enter your headline')
  //   .max(120, 'Headline must be less than 120 characters'),
  // bio: z
  //   .string()
  //   .min(50, 'Bio must be at least 50 characters')
  //   .max(500, 'Bio must be less than 500 characters'),
});

export const socialInfoSchema = z.object({
  linkedinUrl: z
    .string()
    .url('Please enter a valid LinkedIn URL')
    .max(200, 'LinkedIn URL must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  websiteUrl: z
    .string()
    .url('Please enter a valid website URL')
    .max(200, 'Website URL must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  instagramUrl: z
    .string()
    .url('Please enter a valid Instagram URL')
    .max(200, 'Instagram URL must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  facebookUrl: z
    .string()
    .url('Please enter a valid Facebook URL')
    .max(200, 'Facebook URL must be less than 200 characters')
    .optional()
    .or(z.literal('')),
});

export const agreementSchema = z.object({
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
  agreeToPrivacy: z.boolean().refine((val) => val === true, 'You must agree to the privacy policy'),
  receiveUpdates: z.boolean().optional(),
});

// export const socialInfoSchema = z.object({
//   linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
//   websiteUrl: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
//   instagramUrl: z.string().url('Please enter a valid Instagram URL').optional().or(z.literal('')),
//   facebookUrl: z.string().url('Please enter a valid Facebook URL').optional().or(z.literal('')),
// });

// export const professionalInfoSchema = z.object({
//   expertise: z.string().min(1, 'Please select your expertise area'),
//   experience: z.string().min(1, 'Please select your experience level'),
//   education: z.string().min(1, 'Please select your education level'),
//   language: z.string().min(1, 'Please select your language'),
//   headline: z.string().min(1, 'Please enter your headline'),
//   bio: z
//     .string()
//     .min(50, 'Bio must be at least 50 characters')
//     .max(500, 'Bio must be less than 500 characters'),
// });

// export const agreementSchema = z.object({
//   agreeToTerms: z
//     .boolean()
//     .refine((val) => val === true, 'You must agree to the terms and conditions'),
//   agreeToPrivacy: z.boolean().refine((val) => val === true, 'You must agree to the privacy policy'),
//   receiveUpdates: z.boolean().optional(),
// });

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type SocialInfo = z.infer<typeof socialInfoSchema>;
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;
export type Agreement = z.infer<typeof agreementSchema>;
export type InstructorRegistrationData = z.infer<typeof instructorRegistrationSchema>;
