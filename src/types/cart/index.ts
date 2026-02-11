import { CourseInfo } from '../course';

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  courseId: string;
  course: CourseInfo;
  addedAt: string;
}
