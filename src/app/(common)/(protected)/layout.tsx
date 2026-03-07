import React, { Suspense, ReactNode } from 'react';
import { requireAuth } from '@/lib/auth/require-auth';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Ensure the user is authenticated with accepted roles before rendering children
  await requireAuth({
    roles: ['instructor', 'student'],
    redirectTo: '/',
  });

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground relative">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <span className="animate-pulse text-lg">Loading protected area...</span>
          </div>
        }
      >
        {children}
      </Suspense>
      {/* Reserved div for protected area modals or portals */}
      <div id="protected-modal-root" />
    </main>
  );
}
