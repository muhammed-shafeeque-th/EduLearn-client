import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CourseAnalyticsDashboard } from './_components/course-analytics-dashboard';
import { serverCourseService } from '@/services/server-service-clients';
import { CourseAnalytics as CA } from '@/services/course.service';
import { CourseAnalytics } from '@/types/course';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function normalizeCourseAnalytics(data: CA): CourseAnalytics {
  return {
    totalStudents: data?.totalStudents ?? 0,
    completionRate: data?.completionRate ?? 0,
    averageProgress: data?.averageProgress ?? 0,
    engagementRate: data?.engagementRate ?? 0,
    revenueThisMonth: data?.revenueThisMonth ?? 0,
    revenueTotal: data?.revenueTotal ?? 0,
    ratingsBreakdown: data?.ratingsBreakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    enrollmentTrend: data?.enrollmentTrend ?? [],
    contentAnalytics: {
      mostWatchedLessons: data?.contentAnalytics?.mostWatchedLessons ?? [],
      dropOffPoints: data?.contentAnalytics?.dropOffPoints ?? [],
    },
    revenueMetrics: data?.revenueMetrics ?? {
      thisMonth: data?.revenueThisMonth ?? 0,
      total: data?.revenueTotal ?? 0,
    },
    studentMetrics: data?.studentMetrics ?? {
      total: data?.totalStudents ?? 0,
      completionRate: data?.completionRate ?? 0,
      averageProgress: data?.averageProgress ?? 0,
      engagementRate: data?.engagementRate ?? 0,
      ratingsBreakdown: data?.ratingsBreakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      enrollmentTrend: data?.enrollmentTrend ?? [],
    },
    contentPerformance: data?.contentPerformance ?? {
      mostWatchedLessons: data?.contentAnalytics?.mostWatchedLessons ?? [],
      dropOffPoints: data?.contentAnalytics?.dropOffPoints ?? [],
    },
    recentActivities: data?.recentActivities ?? [],
  };
}

async function getCourseAnalytics(id: string): Promise<CourseAnalytics | null> {
  const result = await serverCourseService.getCourseAnalytics(id);

  if (!result.success || !result.data) {
    return null;
  }

  return normalizeCourseAnalytics(result.data);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Course Analytics of ${id} | Instructor Dashboard`,
    description: 'Detailed analytics and insights for your course performance.',
  };
}

export default async function CourseAnalyticsPage({ params }: PageProps) {
  const { id } = await params;
  const analytics = await getCourseAnalytics(id);

  if (!analytics) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Suspense fallback={<div>Loading analytics...</div>}>
          <CourseAnalyticsDashboard
            analytics={{ analytics, courseId: id, title: 'Course Analytics' }}
          />
        </Suspense>
      </div>
    </div>
  );
}
