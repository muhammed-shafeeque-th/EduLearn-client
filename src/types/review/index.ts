import { Course } from '../course';
import { User } from '../user';

export interface Review {
  id: string;
  courseId: string;
  course: Course;
  userId: string;
  user: User;
  rating: number;
  comment: string;
  createdAt: string;
}
