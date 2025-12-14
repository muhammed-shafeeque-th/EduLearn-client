/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchTime: number; // in seconds
  totalDuration: number; // in seconds
  lastWatchedAt: string;
  completedAt?: string;
  progressPercentage: number;
}

export interface QuizProgress {
  quizId: string;
  completed: boolean;
  attempts: QuizAttempt[];
  bestScore: number;
  lastAttemptAt: string;
  completedAt?: string;
}

export interface QuizAttempt {
  id: string;
  score: number;
  answers: number[];
  timeSpent: number; // in seconds
  attemptedAt: string;
  completedAt: string;
}

export interface SectionProgress {
  sectionId: string;
  itemsCompleted: number;
  totalItems: number;
  progressPercentage: number;
  estimatedTimeRemaining: number; // in minutes
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  enrolledAt: string;
  lastAccessedAt: string;
  totalWatchTime: number; // in seconds
  lessonsProgress: Record<string, LessonProgress>;
  quizzesProgress: Record<string, QuizProgress>;
  sectionsProgress: Record<string, SectionProgress>;
  overallProgress: {
    completedItems: number;
    totalItems: number;
    progressPercentage: number;
    estimatedTimeRemaining: number; // in minutes
  };
  milestones: CourseMilestone[];
  certificates: CourseCertificate[];
}

export interface CourseMilestone {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
  type: 'section_complete' | 'quiz_passed' | 'course_complete' | 'perfect_score' | 'speed_learner';
  metadata?: Record<string, any>;
}

export interface CourseCertificate {
  id: string;
  courseId: string;
  userId: string;
  issuedAt: string;
  finalScore: number;
  completionTime: number; // in hours
  certificateUrl?: string;
}
