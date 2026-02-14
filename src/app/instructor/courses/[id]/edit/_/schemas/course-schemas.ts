import { z } from 'zod';

// Regular expression allowing letters, numbers, space, and some common punctuation,
// but not <, >, {, }, /, \, |, ", ', [, ], `, ~, ^, etc.
// Expanded regex for more punctuation, writing, and diacritics.
// Allows Unicode letters and numerals (\p{L}\p{N}), whitespace, and an extended set of common punctuation including:
// . , : ; - & ( ) ! ? @ # $ % * + _ = [ ] / \ ' " { } | < > ~ ` ^ ° ¡ ¿ “ ” ‘ ’ — … °
const noSpecialCharsRegex = /^[\p{L}\p{N}\s.,:;,\-–—&()!?@#$%*+_=\[\]\/\\'"{}|<>~`^°¡¿“”‘’…•]+$/iu;

// Helper: Count alphanumeric characters in string
const countAlphanumeric = (val: string) => (val.match(/[a-zA-Z0-9]/g) || []).length;

// Utility for safe title fields; reject suspicious characters and ensure minimum alphanumeric chars
const safeString = (field: string, min: number, max: number, minAlphaNum: number) =>
  z
    .string({ required_error: `${field} is required` })
    .trim()
    .min(min, `${field} must be at least ${min} characters`)
    .max(max, `${field} cannot exceed ${max} characters`)
    .refine((val) => noSpecialCharsRegex.test(val), {
      message: `${field} contains invalid or unsafe characters`,
    })
    .refine((val) => countAlphanumeric(val) >= minAlphaNum, {
      message: `${field} must contain at least ${minAlphaNum} alphanumeric characters (letters or numbers)`,
    });

// Reusable validators - all fields required
const positiveNumber = z
  .number({ required_error: 'This field is required' })
  .min(0, 'Must be greater than 0')
  .max(1000000, 'Value too large');

const urlString = z
  .string({ required_error: 'This field is required' })
  .url('Must be a valid URL')
  .trim();

// Utility for non-empty fields that should also be alphanumeric
const nonEmptyString = z
  .string({ required_error: 'This field is required' })
  .trim()
  .min(1, 'This field is required')
  .refine((val) => noSpecialCharsRegex.test(val), {
    message: 'This field contains invalid or unsafe characters',
  })
  .refine((val) => countAlphanumeric(val) >= 1, {
    message: 'Must contain at least 1 alphanumeric character',
  });

// Duration validation, both fields required
const durationSchema = z.object({
  value: z
    .string({ required_error: 'Duration is required' })
    .trim()
    .min(1, 'Duration must be at least 1')
    .refine(
      (v) => {
        const num = Number(v);
        return !isNaN(num) && num >= 1 && num <= 365;
      },
      { message: 'Duration must be a number between 1 and 365' }
    ),
  unit: z.enum(['days', 'weeks', 'months'], { required_error: 'Duration unit is required' }),
});

export const basicInfoSchema = z
  .object({
    courseId: z.string().trim().optional(),
    // For course title, require at least 5 alphanumeric chars.
    title: safeString('Title', 10, 100, 5),
    // For subtitle, at least 3 alphanumeric chars.
    subTitle: safeString('Subtitle', 3, 150, 3),
    category: nonEmptyString,
    subCategory: nonEmptyString,
    topics: z
      .array(
        nonEmptyString
          .refine((val) => val.length <= 50, {
            message: 'Topic too long',
          })
          .refine((val) => countAlphanumeric(val) >= 1, {
            message: 'Topic must contain at least 1 alphanumeric character',
          }),
        { required_error: 'Topics are required' }
      )
      .min(1, 'At least one topic required')
      .max(10, 'Maximum 10 topics allowed'),
    language: nonEmptyString,
    subtitleLanguage: nonEmptyString,
    level: z.enum(['beginner', 'intermediate', 'advanced', 'all levels'], {
      required_error: 'Course level is required',
      invalid_type_error: 'Invalid level',
    }),
    duration: durationSchema,
    price: positiveNumber.default(0.1),
    discountPrice: z.number().min(0).optional(),
    currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  })
  .refine((data) => !data.discountPrice || data.discountPrice < data.price, {
    message: 'Discount price must be less than original price',
    path: ['discountPrice'],
  })
  .refine((data) => data.price >= 0, {
    message: 'Course price must be set',
    path: ['price'],
  });

export const advancedInfoSchema = z.object({
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .refine((val) => !/[<>[\]{};/\\|`~^]/.test(val), {
      message: 'Description contains invalid or unsafe characters',
    })
    .refine((val) => countAlphanumeric(val) >= 10, {
      message: 'Description must contain at least 10 alphanumeric characters',
    }),
  thumbnail: urlString,
  trailer: urlString,
  learningOutcomes: z
    .array(
      z.object({
        id: z.string(),
        text: nonEmptyString
          .refine((val) => val.length <= 200, {
            message: 'Outcome too long',
          })
          .refine((val) => countAlphanumeric(val) >= 3, {
            message: 'Outcome must contain at least 3 alphanumeric characters',
          }),
      }),
      { required_error: 'Learning outcomes are required' }
    )
    .min(2, 'At least 2 learning outcomes required')
    .max(10, 'Maximum 10 learning outcomes'),
  targetAudience: z
    .array(
      z.object({
        id: z.string(),
        text: nonEmptyString
          .refine((val) => val.length <= 200, {
            message: 'Audience description too long',
          })
          .refine((val) => countAlphanumeric(val) >= 3, {
            message: 'Audience must contain at least 3 alphanumeric characters',
          }),
      }),
      { required_error: 'Target audience is required' }
    )
    .min(2, 'At least 2 audience descriptions required')
    .max(5, 'Maximum 5 audience descriptions'),
  requirements: z
    .array(
      z.object({
        id: z.string(),
        text: nonEmptyString
          .refine((val) => val.length <= 200, {
            message: 'Requirement too long',
          })
          .refine((val) => countAlphanumeric(val) >= 1, {
            message: 'Requirement must contain at least 1 alphanumeric character',
          }),
      })
    )
    .min(1, 'At least 1 requirement needed')
    .max(10, 'Maximum 10 requirements'),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type AdvancedInfoFormData = z.infer<typeof advancedInfoSchema>;
