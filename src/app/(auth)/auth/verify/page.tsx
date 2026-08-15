import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailForm } from './_/components/verify-email-form';
import { VerifyHero } from './_/components/verify-hero';
import { FormSkeleton } from './_/components/skeletons/form-skeleton';

export const metadata: Metadata = {
  title: 'Verify Email ',
  description: 'Verify your email address to complete your EduLearn account setup',
};

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Hero Section - Hidden on mobile, visible on desktop */}
      <section className="hidden lg:flex lg:w-1/2" aria-label="Verification info">
        <VerifyHero />
      </section>

      {/* Form Section */}
      <section
        className="flex-1 flex items-center justify-center p-4 lg:p-8"
        aria-label="Email verification form"
      >
        <div className="w-full max-w-md space-y-8">
          <header className="text-center space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Verify your email</h1>
            <p className="text-muted-foreground">
              We&apos;ve sent a 6-digit code to your email address.
            </p>
          </header>
          <Suspense fallback={<FormSkeleton />}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
