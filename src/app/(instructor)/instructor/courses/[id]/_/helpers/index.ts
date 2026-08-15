import { serverCourseService } from '@/services/server-service-clients';
import { CourseAnalytics } from '@/types/course';

function normalizeCourseAnalytics(data: Partial<CourseAnalytics>): CourseAnalytics {
  return {
    courseId: data?.courseId ?? '',
    totalStudents: data?.totalStudents ?? 0,
    completionRate: data?.completionRate ?? 0,
    averageProgress: data?.averageProgress ?? 0,
    averageRating: data?.averageRating ?? 0,
    totalRatings: data?.totalRatings ?? 0,
    revenueThisMonth: data?.revenueThisMonth ?? 0,
    revenueLastMonth: data?.revenueLastMonth ?? 0,
    revenueTotal: data?.revenueTotal ?? 0,
    ratingsBreakdown: data?.ratingsBreakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    enrollmentTrend: data?.enrollmentTrend ?? [],
  };
}

export async function getCourseAnalytics(id: string): Promise<CourseAnalytics | null> {
  const result = await serverCourseService.getCourseAnalytics(id);

  if (!result.success || !result.data) {
    return null;
  }

  return normalizeCourseAnalytics(result.data);
}
