import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CourseAnalyticsDashboard } from './_components/course-analytics-dashboard';
import { serverCourseService } from '@/services/server-service-clients';
import { CourseAnalytics } from '@/types/course';
import LoadingScreen from '@/components/ui/loading-screen';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Course ${id} Analytics | Instructor Dashboard`,
    description: 'Detailed analytics and insights for your course performance.',
  };
}

export default async function CourseAnalyticsPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Suspense fallback={<LoadingScreen />}>
          <CourseAnalyticsDashboard courseId={id} />
        </Suspense>
      </div>
    </div>
  );
}
