import React, { Suspense, ReactNode } from 'react';
import { MyChatsPageSkeleton } from '@/components/chat/skeletons/my-chats-page-skeleton';
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
    <main className="h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <Suspense fallback={<MyChatsPageSkeleton />}>{children}</Suspense>
    </main>
  );
}
