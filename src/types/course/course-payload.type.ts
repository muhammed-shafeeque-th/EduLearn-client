import { ContentType } from './course-content.type';

export type BasicInfoRequestPayload = {
  courseId?: string;
  title: string;
  durationValue: string;
  durationUnit: string;
  category: string;
  subCategory: string;
  instructorId?: string;
  topics?: string[];
  language: string;
  level: string;
  price: number;
  discountPrice?: number;
  currency?: string;
  subTitle?: string | undefined;
  subtitleLanguage?: string | undefined;
};

export type AdvancedInfoRequestPayload = {
  description: string;
  learningOutcomes: string[];
  targetAudience: string[];
  requirements: string[];
  thumbnail?: string;
  trailer?: string;
};

// export interface ContentFile {
//   id: string;
//   title: string;
//   type: ContentType;
//   url?: string;
//   size?: number;
//   duration?: number;
//   mimeType?: string;
//   uploadStatus: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
//   progress?: number;
// }

export type LessonType = 'video' | 'document' | 'slides' | 'audio' | 'quiz' | 'assignment' | 'link';

export type CoursePayload = BasicInfoRequestPayload & AdvancedInfoRequestPayload;

export interface SectionPayload {
  title: string;
  description: string | undefined;
  order: number;
  isPublished: boolean | undefined;
}

export type Quiz = {
  id: string;
  title: string;
  questions: QuizQuestionPayload[];
  passingScore: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showResults: boolean;
  isRequired: boolean;
  description?: string | undefined;
  timeLimit?: number | undefined;
};

export type CurriculumRequestPayload = {
  sections: SectionPayload[];
  totalDuration?: number | undefined;
  totalLessons?: number | undefined;
  totalQuizzes?: number | undefined;
};

export type Content = {
  title: string;
  type: 'video' | 'document' | 'slides' | 'audio' | 'quiz' | 'assignment' | 'link';
  id: string;
  isRequired: boolean;
  isPreview: boolean;
  order: number;
  duration?: number | undefined;
  description?: string | undefined;
  quiz?: Quiz | undefined;
  file?: ContentFile | undefined;
  url?: string | undefined;
  metadata?: Record<string, string> | undefined;
};

export type QuizQuestionPayload = {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  id: string;
  question: string;
  points: number;
  required: boolean;
  options?:
    | {
        id: string;
        text: string;
        isCorrect: boolean;
      }[]
    | undefined;
  correctAnswer?: string | undefined;
  explanation?: string | undefined;
  timeLimit?: number | undefined;
};

type ContentFile = {
  id: string;
  name: string;
  type: 'video' | 'document' | 'slides' | 'audio' | 'captions' | 'transcript';
  file?: File | undefined;
  url?: string | undefined;
  s3Upload?:
    | {
        status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
        url: string;
        key: string;
        bucket: string;
        presignedUrl?: string | undefined;
        progress?:
          | {
              loaded: number;
              total: number;
              percentage: number;
              speed?: number | undefined;
              eta?: number | undefined;
            }
          | undefined;
        error?: string | undefined;
      }
    | undefined;
  size?: number | undefined;
  duration?: number | undefined;
  mimeType?: string | undefined;
  thumbnail?: string | undefined;
  metadata?: Record<string, string> | undefined;
};

export interface LessonPayload {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl: string;
  isPreview: boolean;
  estimatedDuration?: number;
  // learningObjectives?: string[];
  isPublished: boolean;
  order: number;
  metadata: {
    fileName?: string;
    title?: string;
    mimeType?: string;
    fileSize?: string | number;
    url?: string;
  };
}

// type SectionPayload = {
//   id: string;
//   title: string;
//   order: number;
//   isPublished: boolean;
//   lessons: LessonPayload[];
//   description?: string | undefined;
//   quiz?: Quiz | undefined;
// };

export interface CheckCourseTitleRequest {
  courseTitle: string;
}
export interface CheckCourseTitleResponse {
  exists: boolean;
  message?: string;
}

export interface LessonContent {
  id: string;
  type: LessonType;
  title: string;
  description?: string;
  file: ContentFile;
  quiz?: Quiz;
  url?: string;
  duration?: number;
  isPreview: boolean;
  isRequired: boolean;
  order: number;
}

export interface QuestionOptionPayload {
  value: string;
  isCorrect: boolean;
}

export interface QuestionPayload {
  question: string;
  explanation: string | undefined;
  points: number | undefined;
  required: boolean | undefined;
  timeLimit: number | undefined;
  type: 'multiple-choice' | 'true-false';
  correctAnswer?: number | undefined | string;
  options?: QuestionOptionPayload[] | undefined;
}

export type QuizPayload = {
  maxAttempts: number | undefined;
  timeLimit: number | undefined;
  showResults: boolean | undefined;
  description: string | undefined;
  isRequired: boolean | undefined;
  passingScore: number | undefined;
  title: string | undefined;
  questions: QuestionPayload[];
};
