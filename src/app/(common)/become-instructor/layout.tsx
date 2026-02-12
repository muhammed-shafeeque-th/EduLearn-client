import React, { Suspense, ReactNode } from 'react';
import { requireAuth } from '@/lib/auth/require-auth';
import { redirect } from 'next/navigation';

interface BecomeInstructorLayoutProps {
  children: ReactNode;
}

export default async function BecomeInstructorLayout({ children }: BecomeInstructorLayoutProps) {
  await requireAuth({
    condition: (user) => user.role === 'student',
    onUnauthorized: (user) => {
      if (user.role === 'instructor') {
        redirect('/instructor');
      } else {
        redirect('/');
      }
    },
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
