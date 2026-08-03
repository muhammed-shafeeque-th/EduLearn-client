import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { RouteFallback } from '@/components/ui/route-fallback';
import { authGuard } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication ',
  description: 'Sign in to your EduLearn account or create a new one.',
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await authGuard({
    condition: (user) => !!user?.id,
    onUnauthorized: () => {
      redirect('/');
    },
    redirectOnException: false,
    // If user not authenticated return null do nothing
    returnNullInsteadOfRedirect: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8"> */}
      <Suspense fallback={<RouteFallback />}>{children}</Suspense>
      {/* </div> */}
    </div>
  );
}

export const dynamic = 'force-dynamic';
