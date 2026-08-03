import { Metadata } from 'next';
import { Suspense } from 'react';
import { InstructorSidebar } from './_/components/instructor-sidebar';
import { InstructorHeader } from './_/components/instructor-header';
import { RouteFallback } from '@/components/ui/route-fallback';
import { authGuard } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/utils/user.utils';
import { Permissions } from '@/lib/auth/auth-guard';
import { ERROR_CODES } from '@/lib/errors/error-codes';

export const metadata: Metadata = {
  title: 'Instructor Dashboard',
  description: 'Manage your courses, students, and earnings.',
};

interface InstructorLayoutProps {
  children: React.ReactNode;
}

export default async function InstructorLayout({ children }: InstructorLayoutProps) {
  await authGuard({
    roles: ['instructor'],
    redirectTo: '/auth/login',
    permissions: [Permissions.INSTRUCTOR_DASHBOARD],
    onUnauthorized: (user) => {
      if (getUserRole(user) === 'student') {
        redirect('/become-instructor');
      }
      redirect(`/?error_code=${ERROR_CODES.INSTRUCTOR_ACCESS_DENIED}`);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <InstructorSidebar />
        <div className="flex-1">
          <InstructorHeader />
          <main className="flex-1">
            <Suspense fallback={<RouteFallback />}>{children}</Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
