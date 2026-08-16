import React, { Suspense, ReactNode } from 'react';
import { authGuard } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/utils/user.utils';
import { ROUTES } from '@/lib/constants/routes';
interface BecomeInstructorLayoutProps {
  children: ReactNode;
}

export default async function BecomeInstructorLayout({ children }: BecomeInstructorLayoutProps) {
  // Disable instructors to not access but all students and no
  await authGuard({
    condition: (user) => getUserRole(user) === 'student',
    onUnauthorized: (user) => {
      if (getUserRole(user) === 'instructor') {
        redirect(ROUTES.instructor.root);
      }
    },
    returnNullInsteadOfRedirect: true,
    redirectOnException: '/',
  });

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground relative">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <span className="animate-pulse text-lg">Loading...</span>
          </div>
        }
      >
        {children}
      </Suspense>
    </main>
  );
}
