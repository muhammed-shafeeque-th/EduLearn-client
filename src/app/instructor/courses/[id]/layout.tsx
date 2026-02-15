import { Metadata } from 'next';
import { Suspense } from 'react';
import LoadingScreen from '@/components/ui/loading-screen';
import { requireAuth } from '@/lib/auth/require-auth';
import { notFound, redirect } from 'next/navigation';
import { fetchServerCourseById } from '@/lib/server-apis';

interface InstructorCourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InstructorCourseLayoutProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const { course } = await fetchServerCourseById(id);

    if (!course) {
      return {
        title: 'Course Not Found',
        description: 'The requested course could not be found',
      };
    }

    return {
      title: `Edit: ${course.title} | Instructor Dashboard`,
      description: course.description || `Edit your course: ${course.title}`,
      robots: {
        index: false, // Prevent edit page indexing
        follow: false,
      },
    };
  } catch (error) {
    console.error('Failed to fetch course for metadata:', error);
    return {
      title: 'Course Not Found',
      description: 'The requested course could not be found',
    };
  }
}

export default async function InstructorCourseLayout({
  params,
  children,
}: InstructorCourseLayoutProps) {
  const { id } = await params;

  const { course } = await fetchServerCourseById(id);

  if (!course) {
    return notFound();
  }

  await requireAuth({
    roles: ['instructor'],
    redirectTo: '/auth/login',
    condition(user, ctx) {
      const { resource } = ctx ?? {};
      return user.id === resource?.instructorId;
    },
    onUnauthorized: () => {
      redirect('/instructor/courses');
    },
    context: {
      resource: course,
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
    </main>
  );
}

export const dynamic = 'force-dynamic';
