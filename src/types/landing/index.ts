// export interface Category {
//   id: string;
//   name: string;
//   icon: React.ReactNode;
//   courses: number;
// }

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
}

export interface Stats {
  courses: number;
  instructors: number;
  students: number;
  reviews: number;
}
