import { z } from 'zod';

export const signinSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),

  rememberMe: z.boolean(),
});

export type SigninFormData = z.infer<typeof signinSchema>;
