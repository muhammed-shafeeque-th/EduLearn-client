import { Course } from '../course';
export interface Review {
  id: string;
  courseId: string;
  enrollmentId: string;
  course: Course;
  userId: string;
  user?: {
    name: string;
    avatar: string;
    id: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}
