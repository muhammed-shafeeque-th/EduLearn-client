import { Lesson } from './course-content.type';

export interface CourseAnalytic {
  totalStudents: number;
  completionRate: number;
  averageProgress: number;
  engagementRate: number;
  revenueThisMonth: number;
  revenueTotal: number;
  ratingsBreakdown: {
    [key: number]: number;
  };
  enrollmentTrend: Array<{
    date: string;
    enrollments: number;
  }>;
  contentAnalytics: {
    mostWatchedLessons: Array<{
      lessonId: string;
      lessonTitle: string;
      viewCount: number;
      avgWatchTime: number;
    }>;
    dropOffPoints: Array<{
      sectionId: string;
      lessonId: string;
      dropOffRate: number;
    }>;
  };
}

export interface AnalyticsTimeRange {
  label: string;
  value: string;
  days: number;
}

export interface RevenueMetrics {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  averagePerStudent: number;
  conversionRate: number;
  refundRate: number;
}

export interface StudentMetrics {
  total: number;
  active: number;
  newThisMonth: number;
  completionDistribution: {
    '0-25': number;
    '26-50': number;
    '51-75': number;
    '76-100': number;
  };
}

export interface ContentPerformance {
  topLessons: Array<{
    id: string;
    title: string;
    views: number;
    avgWatchTime: number;
    engagement: number;
    completionRate: number;
  }>;
  dropOffPoints: Array<{
    sectionId: string;
    lessonId: string;
    title: string;
    dropOffRate: number;
    suggestions: string[];
  }>;
}

export interface CourseAnalytics extends CourseAnalytic {
  revenueMetrics: RevenueMetrics;
  studentMetrics: StudentMetrics;
  contentPerformance: ContentPerformance;
  recentActivities: Array<{
    type: 'comment' | 'rating' | 'purchase' | 'view' | 'completion';
    user: string;
    action: string;
    content: string;
    time: string;
    avatar: string;
    metadata?: Record<string, string>;
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
