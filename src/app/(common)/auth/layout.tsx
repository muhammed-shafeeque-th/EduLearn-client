import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LoadingScreen from '@/components/ui/loading-screen';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/_nextAuth';
// import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication ',
  description: 'Sign in to your EduLearn account or create a new one.',
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // const session = await getServerSession(authOptions);
  // const cookies =
  // console.log(JSON.stringify(session, null, 2));

  // if (session?.user) {
  //   // User is logged in, redirect to home or dashboard
  //   redirect('/');
  // }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8"> */}
      <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
      {/* </div> */}
    </div>
  );
}
