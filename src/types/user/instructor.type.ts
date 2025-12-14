export interface InstructorsFilter {
  search?: string;
  status?: 'active' | 'inactive' | 'pending';
  page?: number;
  limit?: number;
}

export interface InstructorsStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  newThisMonth: number;
  totalCourses: number;
  newCourses: number;
  averageRating: number;
  ratingChange: number;
}
