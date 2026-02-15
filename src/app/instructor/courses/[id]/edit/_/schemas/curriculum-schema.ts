import { z } from 'zod';

// Helper validators for reuse
const nonEmptyString = (field: string) =>
  z
    .string({ required_error: `${field} is required` })
    .min(1, `${field} is required`)
    .trim();

const longString = (field: string, min: number, max: number) =>
  z
    .string({ required_error: `${field} is required` })
    .min(min, `${field} must be at least ${min} characters`)
    .max(max, `${field} cannot exceed ${max} characters`)
    .trim();

// Content type as regular union type (not discriminated)
const videoContentSchema = z.object({
  id: nonEmptyString('Video ID'),
  type: z.literal('video'),
  file: z
    .object({
      id: nonEmptyString('File ID'),
      name: z.string().optional(),
      size: z.string().optional(),
      type: z.string().regex(/^video\//, 'File must be a video'),
      url: z
        .string({
          required_error: 'File URL or S3 key is required',
        })
        .min(1, 'File URL or S3 key is required')
        .refine(
          (val) =>
            // Allow valid URLs or S3 keys (no spaces, some reasonable check)
            /^https?:\/\/\S+$/.test(val) || /^[\w\-\.\/]+$/.test(val),
          {
            message: 'Must be a valid URL or S3 bucket key (no spaces, e.g. "folder/key/file.mp4")',
          }
        ),
      duration: z.number().min(0, 'Duration cannot be negative').optional(),
    })
    .optional(),
  url: z.string().url('Video URL must be a valid URL').optional(),
  isPreview: z.boolean().default(true),
  isRequired: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

// const documentContentSchema = z.object({
//   id: nonEmptyString('Document ID'),
//   type: z.literal('document'),
//   file: z
//     .object({
//       id: nonEmptyString('File ID'),
//       name: nonEmptyString('File name'),
//       size: z
//         .number({ required_error: 'File size is required' })
//         .min(1, 'File size must be greater than 0'),
//       type: z.string().regex(/^(application|text)\//, 'File must be a document'),
//       url: z.string().url('File URL must be a valid URL').optional(),
//     })
//     .optional(),
//   isPreview: z.boolean().default(true),
//   isRequired: z.boolean().default(true),
//   metadata: z.record(z.any()).optional(),
// });

// const audioContentSchema = z.object({
//   id: nonEmptyString('Audio ID'),
//   type: z.literal('audio'),
//   file: z
//     .object({
//       id: nonEmptyString('File ID'),
//       name: nonEmptyString('File name'),
//       size: z
//         .number({ required_error: 'File size is required' })
//         .min(1, 'File size must be greater than 0'),
//       type: z.string().regex(/^audio\//, 'File must be an audio file'),
//       url: z.string().url('File URL must be a valid URL').optional(),
//       duration: z.number().min(0, 'Duration cannot be negative').optional(),
//     })
//     .optional(),
//   isPreview: z.boolean().default(true),
//   isRequired: z.boolean().default(true),
//   metadata: z.record(z.any()).optional(),
// });

// const linkContentSchema = z.object({
//   id: nonEmptyString('Link ID'),
//   type: z.literal('link'),
//   url: z.string({ required_error: 'Link URL is required' }).url('Must be a valid URL'),
//   isPreview: z.boolean().default(true),
//   isRequired: z.boolean().default(true),
//   metadata: z.record(z.any()).optional(),
// });

export const contentSchema = videoContentSchema;
//  z
//   .union([videoContentSchema, documentContentSchema, audioContentSchema, linkContentSchema])
//   .optional();

// QuizQuestion as regular union type
const multipleChoiceQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.literal('multiple-choice'),
  question: longString('Question', 3, 1000),
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        text: longString('Option text', 1, 300),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(2, 'At least 2 options required')
    .max(6, 'Maximum 6 options')
    .refine((options) => options.some((o) => o.isCorrect), {
      message: 'At least one option must be marked as correct',
      path: ['options'],
    }),
  points: z
    .number({ required_error: 'Points are required' })
    .min(1, 'At least 1 point required')
    .default(1),
  explanation: z.string().max(1000, 'Explanation cannot exceed 1000 characters').optional(),
  required: z.boolean().default(true),
  timeLimit: z
    .number()
    .min(0, 'Time limit cannot be negative')
    .max(3600, 'Time limit too high')
    .optional(),
});

// const trueFalseQuestionSchema = z.object({
//   id: z.string().optional(),
//   type: z.literal('true-false'),
//   question: longString('Question', 3, 1000),
//   correctAnswer: z.enum(['true', 'false'], { required_error: 'Correct answer required' }),
//   points: z
//     .number({ required_error: 'Points are required' })
//     .min(1, 'At least 1 point required')
//     .default(1),
//   explanation: z.string().max(1000, 'Explanation cannot exceed 1000 characters').optional(),
//   required: z.boolean().default(true),
//   timeLimit: z
//     .number()
//     .min(0, 'Time limit cannot be negative')
//     .max(3600, 'Time limit too high')
//     .optional(),
// });

export const quizQuestionSchema = multipleChoiceQuestionSchema;
// .union([multipleChoiceQuestionSchema, trueFalseQuestionSchema])
// .refine(
//   (q) => {
//     if (q.type === 'multiple-choice') {
//       return Array.isArray(q.options) && q.options.some((o) => o.isCorrect);
//     }
//     return true;
//   },
//   {
//     message: 'At least one correct answer required',
//     path: ['options'],
//   }
// );
// export const quizQuestionSchema = z
//   .union([multipleChoiceQuestionSchema, trueFalseQuestionSchema])
//   .refine(
//     (q) => {
//       if (q.type === 'multiple-choice') {
//         return Array.isArray(q.options) && q.options.some((o) => o.isCorrect);
//       }
//       return true;
//     },
//     {
//       message: 'At least one correct answer required',
//       path: ['options'],
//     }
//   );

export const quizSchema = z.object({
  id: nonEmptyString('Quiz ID'),
  title: longString('Quiz title', 5, 150),
  description: z.string().max(1000, 'Quiz description cannot exceed 1000 characters').optional(),
  questions: z
    .array(quizQuestionSchema, { required_error: 'Questions are required' })
    .min(1, 'At least one question required')
    .max(50, 'Maximum 50 questions allowed'),
  passingScore: z
    .number({ required_error: 'Passing score is required' })
    .min(0, 'Passing score must be at least 0')
    .max(100, 'Passing score cannot exceed 100')
    .default(70),
  maxAttempts: z
    .number({ required_error: 'Maximum attempts is required' })
    .min(1, 'At least 1 attempt required')
    .max(50, 'Maximum 50 attempts allowed')
    .default(3),
  timeLimit: z
    .number()
    .min(0, 'Time limit cannot be negative')
    .max(7200, 'Time limit too high')
    .default(60),
  randomizeQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  isRequired: z.boolean().default(false),
});

export const lessonSchema = z.object({
  id: nonEmptyString('Lesson ID'),
  title: longString('Lesson title', 3, 100),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  content: contentSchema
    .optional()
    .refine((v) => !!v, { message: 'Lesson content is required', path: ['content'] }),
  estimatedDuration: z
    .number({ required_error: 'Estimated duration is required' })
    .min(1, 'Estimated duration must be at least 1 minute')
    .max(1440, 'Lesson cannot be longer than 24 hours'),
  isPublished: z.boolean().default(false),
  order: z.number().min(0, 'Order cannot be negative').default(0),
});

export const sectionSchema = z.object({
  id: nonEmptyString('Section ID'),
  title: longString('Section title', 3, 100),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  lessons: z
    .array(lessonSchema, { required_error: 'Lessons are required' })
    .min(1, 'At least one lesson required'),
  quiz: quizSchema.optional(),
  isPublished: z.boolean().default(false),
  order: z.number().min(0, 'Order cannot be negative').default(0),
});

export const curriculumSchema = z.object({
  sections: z
    .array(sectionSchema, { required_error: 'Sections are required' })
    .min(2, 'At least two sections required')
    .max(100, 'Maximum 100 sections allowed'),
  totalDuration: z.number().min(0, 'Total duration cannot be negative').optional(),
  totalLessons: z.number().min(0, 'Total lessons cannot be negative').optional(),
  totalQuizzes: z.number().min(0, 'Total quizzes cannot be negative').optional(),
});

export type Content = z.infer<typeof contentSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type CurriculumFormData = z.infer<typeof curriculumSchema>;
