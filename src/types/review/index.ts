import { Course } from '../course';
export interface Review {
  id: string;
  courseId: string;
  enrollmentId: string;
  course?: Course;
  userId: string;
  user?: {
    name: string;
    avatar: string;
    id: string;
  };
  name?: string; // name for UI
  avatar?: string; // avatar for UI
  rating: number;
  comment: string;
  verified?: boolean;
  courseName?: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}
