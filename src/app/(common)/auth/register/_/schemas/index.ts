import { z } from 'zod';

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, 'First name must be at least 3 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
      .transform((str) => str.trim()),

    lastName: z
      .string()
      .trim()
      .min(3, 'Last name must be at least 3 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
      .transform((str) => str.trim()),

    // username: z
    //   .string()
    //   .min(3, 'Username must be at least 3 characters')
    //   .max(20, 'Username must be less than 20 characters')
    //   .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    //   .refine((val) => !val.includes(' '), 'Username cannot contain spaces'),

    email: z
      .string()
      .trim()
      .email('Please enter a valid email address')
      .min(5, 'Email must be at least 5 characters')
      .max(254, 'Email must be less than 254 characters'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
