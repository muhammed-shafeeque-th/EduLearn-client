/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EnrollmentLearnData {
  enrollmentId: string;
  userId: string;
  course: CourseSummary; // subset of Course fields needed for UI
  progressPercent: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  sections: {
    id: string;
    title: string;
    description?: string;
    order: number;
    isPublished: boolean;
    lessons: {
      id: string;
      title: string;
      order: number;
      durationSeconds: number;
      progress: {
        completed: boolean;
        watchedSeconds: number;
        watchedPercent: number;
      };
    }[];
    quiz?: {
      id: string;
      title: string;
      questions: number;
      durationSeconds: number;
      requirePassingScore: boolean;
      passingScore?: number;
      progress: {
        completed: boolean;
        passed?: boolean;
        score?: number;
        attempts?: number;
      };
    };
  }[];
  stats: {
    overallProgress: number;
    completedItems: number;
    totalItems: number;
    totalWatchTimeSeconds: number;
    totalQuizzes: number;
    passedQuizzes: number;
    averageQuizScore: number;
    estimatedTimeRemainingMinutes: number;
    // etc…
  };
  milestones: any[];
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
}

// src/types/enrollment-learn.ts

export type LearningItemType = 'lesson' | 'quiz';

export interface LessonWithProgress {
  id: string;
  title: string;
  order: number;
  durationSeconds: number;
  progress: {
    completed: boolean;
    watchedSeconds: number;
    watchedPercent: number; // 0-100
  };
}

export interface QuizWithProgress {
  id: string;
  title: string;
  questions: number;
  durationSeconds: number;
  requirePassingScore: boolean;
  passingScore?: number;
  progress: {
    completed: boolean;
    passed?: boolean;
    score?: number;
    attempts?: number;
  };
}

export interface EnrollmentSectionItem {
  id: string;
  type: LearningItemType;
  title: string;
  durationSeconds: number;
  questions?: number;
  lesson?: LessonWithProgress;
  quiz?: QuizWithProgress;
}

export interface EnrollmentSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  items: EnrollmentSectionItem[]; // composed from lessons + quiz
}

export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: string;
  language: string;
  rating: number;
  totalRatings: number;
  learningOutcomes: string[];
  requirements: string[];
  // plus the instructor etc. that you already have
  instructor: any;
  durationValue: number;
  durationUnit: string;
  relatedCourses?: CourseSummary[];
}

export interface EnrollmentProgressStats {
  overallProgress: number;
  completedItems: number;
  totalItems: number;
  totalWatchTimeSeconds: number;
  totalQuizzes: number;
  passedQuizzes: number;
  averageQuizScore: number;
  estimatedTimeRemainingMinutes: number;
  studyStreak: number;
  milestonesCount: number;
}

export interface EnrollmentReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
  user: { id: string; name: string };
}

// export export interface EnrollmentLearnData {
//   enrollmentId: string;
//   userId: string;
//   status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
//   progressPercent: number;
//   course: CourseSummary;
//   sections: EnrollmentSection[];
//   stats: EnrollmentProgressStats;
//   milestones: any[];
//   reviews: EnrollmentReview[];
//   userReview?: EnrollmentReview | null;
// }
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  course: EnrollmentCourse | undefined;
  deletedAt?: string | undefined;
}

export interface EnrollmentCourse {
  id: string;
  title: string;
  rating: number;
  thumbnail: string;
  category: string;
  level: string;
  lessonsCount: number;
  instructor: CourseInstructor;
}

export interface CourseInstructor {
  id: string;
  name: string;
  avatar?: string | undefined;
  email?: string | undefined;
}
