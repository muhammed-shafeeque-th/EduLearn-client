import { Metadata } from 'next';
import { Suspense } from 'react';
import { InstructorSidebar } from './_/components/instructor-sidebar';
import { InstructorHeader } from './_/components/instructor-header';
import LoadingScreen from '@/components/ui/loading-screen';
import { requireAuth } from '@/lib/auth/require-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Instructor Dashboard',
  description: 'Manage your courses, students, and earnings.',
};

interface InstructorLayoutProps {
  children: React.ReactNode;
}

export default async function InstructorLayout({ children }: InstructorLayoutProps) {
  await requireAuth({
    roles: ['instructor'],
    redirectTo: '/auth/login',
    onUnauthorized: (user) => {
      if (user.role === 'student') {
        redirect('/become-instructor');
      }
      redirect('/');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <InstructorSidebar />
        <div className="flex-1">
          <InstructorHeader />
          <main className="flex-1">
            <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
