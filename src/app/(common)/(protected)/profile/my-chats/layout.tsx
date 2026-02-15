import React, { Suspense, ReactNode } from 'react';
import { MyChatsPageSkeleton } from './_/components/skeletons/my-chats-page-skeleton';
// import { requireAuth } from '@/lib/auth/require-auth';
// import { redirect } from 'next/navigation';

interface MessagesLayoutProps {
  children: ReactNode;
}

export default async function MessagesLayout({ children }: MessagesLayoutProps) {
  // await requireAuth({
  //   condition: (user) => user.role === 'student',
  //   onUnauthorized: (user) => {
  //     if (user.role === 'instructor') {
  //       redirect('/instructor/messages');
  //     } else {
  //       redirect('/');
  //     }
  //   },
  //   redirectOnException: '/',
  // });

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground relative">
      <Suspense fallback={<MyChatsPageSkeleton />}>{children}</Suspense>
    </main>
  );
}
