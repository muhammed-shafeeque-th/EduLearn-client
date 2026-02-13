import { Review } from '../review';
import { Section } from './course-content.type';

export type CourseStatus = 'draft' | 'published' | 'unpublished' | 'deleted';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all levels';

export interface Course {
  id: string;
  instructorId: string;
  slug: string;
  title: string;
  certificate: boolean;
  subTitle: string;
  description: string;
  category: string;
  subCategory: string;
  level: CourseLevel;
  language: string;
  thumbnail: string;
  trailer: string;
  rating: number;
  totalRatings: number;
  students: number;
  price: number;
  topics: string[];
  discountPrice: number;
  currency: string;
  subtitleLanguage: string;
  status: CourseStatus;
  updatedAt: string;
  createdAt: string;
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  instructor: Instructor;
  sections: Section[];
  completionCertificate?: boolean;
  durationValue: number;
  durationUnit: string;
  relatedCourses?: Course[];
  reviews?: Review[];
}

export interface CourseMeta {
  id: string;
  title: string;
  topics: string[];
  instructorId: string;
  subTitle: string;
  category: string;
  subCategory: string;
  language: string;
  subtitleLanguage: string;
  level: string;
  durationValue: number;
  durationUnit: string;
  description?: string | undefined;
  learningOutcomes: string[];
  targetAudience: string[];
  requirements: string[];
  thumbnail: string;
  trailer: string;
  status: string;
  slug: string;
  rating: number;
  numberOfRating: number;
  students: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
  price: number;
  noOfLessons: number;
  noOfSections: number;
  noOfQuizzes: number;
  discountPrice?: number | undefined;
  currency?: string | undefined;
  instructor: Instructor;
}

interface Instructor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface CourseInfo {
  thumbnail: string;
  id: string;
  slug: string;
  title: string;
  level: CourseLevel;
  rating: number;
  totalRatings: number;
  students: number;
  durationValue: number;
  durationUnit: string;
  status: CourseStatus;
  price: number;
  discountPrice: number;
  instructor: Instructor;
}
