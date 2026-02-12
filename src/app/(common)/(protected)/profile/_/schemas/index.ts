'use client';

import { z } from 'zod';

// This regex checks for special characters at the beginning of a string
const noSpecialCharAtStart = /^[A-Za-z0-9_]/;

// Simple country code validation (ISO Alpha-2, e.g. "US", "IN", "FR")
const countryCodeRegex = /^[A-Za-z]{2}$/;

// For phone validation according to country, here's a simple illustrative set.
// For real validation, use something like libphonenumber-js with custom zod refinement.
// Here is a simple approach for demonstration.
const countryPhoneRegex: Record<string, RegExp> = {
  US: /^(\+1)?\s?\(?[2-9][0-9]{2}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, // US (North America)
  IN: /^(\+91)?[-\s]?[6-9]\d{9}$/, // India
  // Add other countries as needed
};

export const userProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, { message: 'Please enter your first name (min 3 chars, no special char at start)' })
      .refine((val) => noSpecialCharAtStart.test(val), {
        message: 'Please enter your first name (min 3 chars, no special char at start)',
      }),
    lastName: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || (val.length >= 3 && noSpecialCharAtStart.test(val)), {
        message: 'Please enter your last name (min 3 chars, no special char at start)',
      }),
    biography: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || val.length >= 10, {
        message: 'Biography must be at least 10 characters',
      })
      .refine((val) => !val || val.length <= 500, {
        message: 'Biography must not exceed 500 characters',
      })
      .refine(
        (val) => {
          // Allow only printable characters & limit inappropriate special characters at the start
          if (!val) return true;
          if (!/^[A-Za-z0-9]/.test(val)) return false;
          // For demonstration: disallow HTML/script tags
          if (/<[^>]*>/g.test(val)) return false;
          return true;
        },
        {
          message: 'Biography should start with a letter or number and not contain HTML tags',
        }
      ),
    website: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || noSpecialCharAtStart.test(val), {
        message: 'Website cannot start with a special character',
      }),
    language: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || noSpecialCharAtStart.test(val), {
        message: 'Language cannot start with a special character',
      }),
    socials: z.object({
      facebook: z
        .string()
        .trim()
        .optional()
        .refine(
          (val) => !val || /^https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.-]+\/?$/.test(val),
          {
            message: 'Please enter a valid Facebook profile URL',
          }
        ),
      instagram: z
        .string()
        .trim()
        .optional()
        .refine(
          (val) => !val || /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.-]+\/?$/.test(val),
          {
            message: 'Please enter a valid Instagram profile URL',
          }
        ),
      linkedin: z
        .string()
        .trim()
        .optional()
        .refine(
          (val) => !val || /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_.-]+\/?$/.test(val),
          {
            message: 'Please enter a valid LinkedIn profile URL',
          }
        ),
    }),
    avatar: z.string().trim().url({ message: 'Avatar must be a valid URL' }).optional(),

    country: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || (val.length === 2 && countryCodeRegex.test(val)), {
        message: 'Please select a valid 2-letter country code',
      }),

    city: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || val.length >= 2, {
        message: 'Please enter a city with at least 2 characters',
      }),

    // Fix for "Property 'parent' does not exist on type 'RefinementCtx'"
    phone: z
      .string()
      .trim()
      .optional()
      .superRefine((val, ctx) => {
        if (!val || val.length === 0) {
          // optional
          return;
        }
        // Only test length after trimming
        if (val.length < 7) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 7,
            type: 'string',
            inclusive: true,
            message: 'Phone number is too short',
          });
          return;
        }
        if (val.length > 20) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            maximum: 20,
            type: 'string',
            inclusive: true,
            message: 'Phone number is too long',
          });
          return;
        }
        // Fallback: Accept numbers, spaces, dashes, parentheses, plus
        if (!/^[\d+\-\s()]+$/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number must be valid',
          });
        }
      }),
    gender: z
      .enum(['male', 'female', 'other'], { message: 'Please select your gender' })
      .optional(),
    // --- Add refinement at the object level for country-specific phone validation
  })
  .superRefine((obj, ctx) => {
    const { phone, country } = obj;
    if (
      phone &&
      phone.length >= 7 &&
      phone.length <= 20 &&
      typeof country === 'string' &&
      country.trim().length === 2
    ) {
      const countryCode = country.trim().toUpperCase();
      if (countryPhoneRegex[countryCode]) {
        if (!countryPhoneRegex[countryCode].test(phone)) {
          ctx.addIssue({
            path: ['phone'],
            code: z.ZodIssueCode.custom,
            message: `Please enter a valid phone number for ${countryCode}`,
          });
        }
      }
    }
  });

export type UserProfileType = z.infer<typeof userProfileSchema>;
