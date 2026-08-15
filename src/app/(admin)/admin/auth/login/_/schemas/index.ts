import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email' }),
  password: z.string().min(1, { message: 'Invalid password' }),
});

export type AdminLoginSchemaType = z.infer<typeof adminLoginSchema>;
