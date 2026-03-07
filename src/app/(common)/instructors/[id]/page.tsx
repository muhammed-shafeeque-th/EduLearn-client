import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { InstructorPageContent } from './_/components/instructor-page-content';
import type { Metadata } from 'next';
import { User } from '@/types/user';
import { InstructorPageSkeleton } from './_/components/skeletons/instructor-page-skeleton';
import { fetchApi } from '@/lib/server-apis/server-apis';
import { ERROR_CODES } from '@/lib/errors/error-codes';

interface InstructorPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getInstructor(userId: string) {
  try {
    const userResponse = await fetchApi<User>(`users/${userId}`, {
      next: { revalidate: 600 }, // refresh every 2 min
    });

    if (!userResponse.success) {
      throw new Error(userResponse.message);
    }
    if (userResponse.data.role !== 'instructor') {
      throw new Error('User is not an instructor.');
    }
    return userResponse.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateMetadata({ params }: InstructorPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const instructor = await getInstructor(id)!;

    if (!instructor) {
      return {
        title: 'instructor not found',
      };
    }

    return {
      title: `${instructor?.firstName} ${instructor?.lastName} - Instructor Profile`,
      description: `Learn from ${instructor?.username}, ${instructor?.instructorProfile?.expertise}. ${instructor?.instructorProfile?.totalStudents}+ students and ${instructor?.instructorProfile?.rating} reviews.`,
      keywords: [
        'instructor',
        'teacher',
        'courses',
        ...(instructor?.username ? [instructor.username] : []),
        ...(instructor?.instructorProfile?.tags?.slice(0, 3) || []),
      ],
      openGraph: {
        title: `${instructor?.username} - Expert Instructor`,
        description: instructor?.instructorProfile?.bio?.slice(0, 160),
        type: 'profile',
      },
    };
  } catch {
    return {
      title: 'Instructor Not Found',
      description: 'The instructor you are looking for could not be found.',
    };
  }
}

export default async function InstructorPage({ params }: InstructorPageProps) {
  const { id } = await params;

  const instructor = await getInstructor(id);

  if (!instructor) notFound();

  if (instructor.role !== 'instructor') {
    redirect(`/error_code=${ERROR_CODES.NOT_FOUND}`);
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<InstructorPageSkeleton />}>
          <InstructorPageContent instructorId={id} initialData={instructor} />
        </Suspense>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl opacity-50" />
      </div>
    </main>
  );
}
