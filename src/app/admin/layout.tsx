import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'EduLearn Admin Dashboard',
  description: 'Educational platform administration with advanced analytics',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <span className="animate-pulse text-lg">Loading admin area...</span>
          </div>
        }
      >
        {children}
      </Suspense>
      <div id="admin-modal-root" />
    </main>
  );
}
