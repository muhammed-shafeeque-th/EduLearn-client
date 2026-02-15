import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { EnrollmentLearningClient } from './_/components/learning-page-client';
import EnrollmentPageSkeleton from './loading';
import { fetchServerEnrollment } from '@/lib/server-apis/enrollment-api';
import { requireAuth } from '@/lib/auth';
import { ERROR_CODES } from '@/lib/errors/error-codes';

interface EnrollmentPageProps {
  params: Promise<{ enrollmentId: string }>;
  searchParams: Promise<{
    itemId?: string;
    itemType?: 'lesson' | 'quiz';
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: EnrollmentPageProps): Promise<Metadata> {
  const { enrollmentId } = await params;

  try {
    const { enrollment, success } = await fetchServerEnrollment(enrollmentId);

    if (!enrollment || !success) {
      return {
        title: 'Enrollment Not Found',
      };
    }

    return {
      title: `Learn - ${enrollment.courseId} | EduLearn`,
      description: `Continue learning your enrolled course`,
      robots: {
        index: false, // Don't index learning pages
        follow: false,
      },
    };
  } catch {
    return {
      title: 'Enrollment Not Found',
    };
  }
}

/**
 * Main page component
 */
export default async function EnrollmentPage({ params, searchParams }: EnrollmentPageProps) {
  const { enrollmentId } = await params;
  const { itemId, itemType } = await searchParams;

  const currentUser = await requireAuth({
    // roles: ['student'],
    redirectTo: `/auth/login?next=/learn/${enrollmentId}`,

    // condition: async () => {
    //   // Authorization Check
    //   const { enrolled } = await checkServerEnrollment(enrollmentId);
    //   return !!enrolled;
    // },
    // onUnauthorized() {
    //   return redirect(`/courses?error_code=${ERROR_CODES.NOT_ENROLLED}`);
    // },
  });

  const { enrollment, success } = await fetchServerEnrollment(enrollmentId);

  if (!enrollment || !success) {
    return redirect(`/courses?error_code=${ERROR_CODES.ENROLLMENT_NOT_FOUND}`);
    // notFound();
  }

  if (enrollment.userId !== currentUser?.id) {
    return redirect(`/courses?error_code=${ERROR_CODES.NOT_ENROLLED}`);
  }

  // Check enrollment status
  if (enrollment.status === 'DROPPED') {
    redirect(`/courses?error_code=${ERROR_CODES.COURSE_ENROLLMENT_DROPPED}`);
  }

  return (
    <Suspense fallback={<EnrollmentPageSkeleton />}>
      <EnrollmentLearningClient
        enrollmentId={enrollmentId}
        initialEnrollment={enrollment}
        user={currentUser!}
        initialItemId={itemId}
        initialItemType={itemType}
      />
    </Suspense>
  );
}
