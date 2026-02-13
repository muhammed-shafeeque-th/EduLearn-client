export interface EnrollmentDetail {
  enrollmentId: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolledAt: string;
  sections: EnrollmentSection[];
}

export interface EnrollmentSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  lessons: LessonWithProgress[];
  quiz?: QuizWithProgress;
}

export interface LessonWithProgress {
  id: string;
  title: string;
  order: number;
  duration?: number; // seconds
  completed: boolean;
  completedAt?: string;
}
export interface QuestionOption {
  value: string;
  isCorrect: boolean;
}

export interface QuestionOption {
  value: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  requirePassingScore: boolean;
  options: QuestionOption[];
  timeLimit?: number | undefined;
  question: string;
  explanation?: string | undefined;
  score?: number | undefined;
  correctAnswer?: string | undefined;
  type: string;
}

export interface QuizWithProgress {
  id: string;
  title: string;
  description?: string | undefined;
  questions: QuizQuestion[];
  timeLimit?: number | undefined;
  requirePassingScore: boolean;
  passingScore?: number | undefined;
  completed: boolean;
  passed?: boolean | undefined;
  score?: number | undefined;
  completedAt?: string | undefined;
}

/**
 * Backend : EnrollmentProgressResponse
 * Maps to GetEnrollmentProgressUseCase response
 */
export interface EnrollmentProgressResponse {
  enrollmentId: string;
  courseId: string;
  userId: string;
  overallProgress: number;
  completedUnits: number;
  totalUnits: number;
  lessons: LessonProgress[];
  quizzes: QuizProgress[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  watchTime?: number; // seconds
  duration?: number; // seconds
  progressPercent?: number;
}

export interface QuizProgress {
  quizId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  passed: boolean;
  completedAt?: string;
}

/**
 * Backend : UpdateLessonProgressResponse
 * Maps to CompleteLessonUseCase response
 */
export interface UpdateLessonProgressResponse {
  completed: boolean;
  progressPercent: number;
  milestone?: {
    id: string;
    type: 'LESSON_COMPLETED';
    achievedAt: string;
  };
}

/**
 * Backend : SubmitQuizAttemptResponse
 * Maps to SubmitQuizAttemptUseCase response
 */
export interface SubmitQuizAttemptResponse {
  score: number;
  passed: boolean;
  completed: boolean;
  attempts: number;
  milestone?: {
    id: string;
    type: 'QUIZ_PASSED' | 'QUIZ_PERFECT';
    achievedAt: string;
  };
}

/**
 * Request payloads
 */
export interface UpdateLessonProgressPayload {
  currentTime: number; // seconds
  duration: number; // seconds
  event: 'timeupdate' | 'completed';
}

export interface SubmitQuizAttemptPayload {
  answers: { questionId: string; answers: string[] }[];
  timeSpent: number; // seconds
}

export interface SubmitCourseReviewPayload {
  rating: number;
  comment: string;
}

/**
 * Video URL response (for signed URLs)
 */
export interface SignedVideoUrlResponse {
  url: string;
  expiresAt: number; // timestamp
  duration?: number; // video duration in seconds
}

/**
 * Flattened item type for navigation
 */
export type CourseItem = {
  id: string;
  type: 'lesson' | 'quiz';
  sectionId: string;
  sectionTitle: string;
  title: string;
  order: number;
  data: LessonWithProgress | QuizWithProgress;
};

/**
 * UI State types
 */
export interface ProgressStats {
  overallProgress: number;
  completedUnits: number;
  totalUnits: number;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  totalWatchTime: number; // seconds
  averageQuizScore: number;
}
