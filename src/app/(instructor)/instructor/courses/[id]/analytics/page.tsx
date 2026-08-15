import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CourseAnalyticsDashboard } from './_components/course-analytics-dashboard';
import LoadingScreen from '@/components/ui/loading-screen';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
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
