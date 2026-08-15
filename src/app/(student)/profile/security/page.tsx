import { Suspense } from 'react';
import { SecurityPageContent } from './_/components/security-page-content';
import { SecurityPageSkeleton } from './_/components/skeletons/security-page-skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Settings - EduLearn',
  description: 'Manage your account security, password, and authentication settings',
  keywords: ['security', 'password', 'authentication', '2fa', 'account'],
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<SecurityPageSkeleton />}>
        <SecurityPageContent />
      </Suspense>
    </div>
  );
}
