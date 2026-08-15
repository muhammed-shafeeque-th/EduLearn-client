'use client';

import { useCurrentUser } from '@/states/server/user/use-current-user';
import { SecurityForm } from './security-form';
import { Suspense } from 'react';
import { SecurityPageSkeleton } from './skeletons/security-page-skeleton';

export function SecurityPageContent() {
  const { data: userData, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return <SecurityPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Unable to load security settings
          </h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access security settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}

      {/* Page Content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Security Settings</h1>
            <p className="text-muted-foreground">
              Manage your account security, password, and authentication preferences
            </p>
          </div>

          {/* Security Form */}
          <div className="bg-card rounded-lg shadow-sm border">
            <Suspense fallback={<div className="p-6">Loading security settings...</div>}>
              <SecurityForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
