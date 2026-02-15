export type ContentType =
  | 'video'
  | 'document'
  | 'slides'
  | 'audio'
  | 'quiz'
  | 'assignment'
  | 'link';

export type QuizType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options?: Array<QuestionOption>;
  correctAnswer?: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
  required: boolean;
}

export interface QuestionOption {
  value: string;
  isCorrect: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showResults: boolean;
  isRequired: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl: string;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
  estimatedDuration?: number;
  isPublished: boolean;
  order: number;
  metadata: {
    fileName: string;
    title: string;
    mimeType: string;
    fileSize: string;
    url: string;
  };
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  quiz?: Quiz;
  isPublished: boolean;
  order: number;
}
