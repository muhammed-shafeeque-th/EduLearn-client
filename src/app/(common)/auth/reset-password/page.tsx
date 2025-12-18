import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from './_/components/reset-password-form';
import { ResetPasswordHero } from './_/components/reset-password-hero';
import { ResetPasswordSkeleton } from './_/components/skeletons/reset-password-skeleton';

export const metadata: Metadata = {
  title: 'Reset Password ',
  description: 'Create a new password for your EduLearn account',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex lg:w-1/2">
        <ResetPasswordHero />
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <Suspense fallback={<ResetPasswordSkeleton />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
