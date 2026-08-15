import { z } from 'zod';

const digitSchema = z
  .string()
  .length(1, 'Each digit must be exactly 1 character')
  .regex(/^\d$/, 'Only numbers are allowed');

export const verifyEmailSchema = z.object({
  digit1: digitSchema,
  digit2: digitSchema,
  digit3: digitSchema,
  digit4: digitSchema,
  digit5: digitSchema,
  digit6: digitSchema,
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
