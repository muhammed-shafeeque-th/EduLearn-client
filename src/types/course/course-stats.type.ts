import { Lesson } from './course-content.type';

/**
 * Course analytics data returned from the API gateway.
 * This interface matches the actual backend response shape.
 */
export interface CourseAnalytics {
  courseId: string;
  totalStudents: number;
  completionRate: number;
  averageProgress: number;
  averageRating: number;
  totalRatings: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueTotal: number;
  ratingsBreakdown: {
    [key: number]: number;
  };
  enrollmentTrend: Array<{
    month: number;
    enrollments: number;
  }>;
}

export interface CurriculumSection {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
}

export interface CourseStats {
  lessons: number;
  comments: number;
  students: number;
  hours: number;
  attachments: number;
  views: number;
}

export interface SyllabusSection {
  id: string;
  title: string;
  lessonsCount: number;
  duration: string;
  lessons: Lesson[];
  isExpanded?: boolean;
}

// export interface Review {
//   id: string;
//   userId: string;
//   user: {
//     name: string;
//     avatar: string;
//   };
//   rating: number;
//   comment: string;
//   date: string;
//   helpful: number;
// }

export interface Testimonial {
  id: string;
  user: {
    name: string;
    avatar: string;
    title: string;
  };
  content: string;
  rating: number;
}

// export interface Lesson {
//   id: string;
//   title: string;
//   duration: string;
//   videoUrl: string;
//   completed: boolean;
//   type: 'lesson';
// }

// export type QuizPayload =
//   | {
//       courseId: string | undefined;
//       sectionId: string;
//       question: string;
//       explanation: string | undefined;
//       points: number | undefined;
//       required: boolean | undefined;
//       timeLimit: number | undefined;
//       type: 'multiple-choice';
//       correctAnswer: number | undefined;
//       options: string[] | undefined;
//     }
//   | {
//       courseId: string | undefined;
//       sectionId: string;
//       question: string;
//       correctAnswer: string | undefined;
//       explanation: string | undefined;
//       points: number | undefined;
//       required: boolean | undefined;
//       timeLimit: number | undefined;
//       type: 'true-false' | 'short-answer' | 'essay';
//       options?: undefined;
//     };
