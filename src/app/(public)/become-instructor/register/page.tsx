import { Metadata } from 'next';
import { Suspense } from 'react';
import { InstructorRegistrationForm } from './_/components/registration-form';
import RegistrationHero from './_/components/registration-hero';
import { RegistrationBenefits } from './_/components/registration-benefits';
import { RegistrationSkeleton } from './_/components/skeletons/registration-skeleton';

export const metadata: Metadata = {
  title: 'Become an Instructor - Start Teaching Today',
  description:
    'Join thousands of successful instructors on EduLearn. Create your account and start teaching students worldwide.',
  keywords: ['instructor registration', 'teach online', 'join edulearn', 'instructor account'],
};

export default async function InstructorRegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<RegistrationSkeleton />}>
        <main className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Side - Hero & Benefits */}
            <section className="space-y-8" aria-label="Why Register as Instructor">
              <RegistrationHero />
              <RegistrationBenefits />
            </section>
            {/* Right Side - Registration Form */}
            <aside className="lg:sticky lg:top-8" aria-label="Instructor Registration Form">
              <InstructorRegistrationForm />
            </aside>
          </div>
        </main>
      </Suspense>
    </div>
  );
}

export const dynamic = 'force-dynamic';
