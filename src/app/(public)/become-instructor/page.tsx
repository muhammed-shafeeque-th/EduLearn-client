import { Metadata } from 'next';
import { Suspense } from 'react';
import { BecomeInstructorHero } from './_/components/hero-section';
import { StatsSection } from './_/components/stats-section';
import { WhyTeachSection } from './_/components/why-teach-section';
import { HowToBecomeSection } from './_/components/how-to-become-section';
import { RulesSection } from './_/components/rules-section';
import { SupportSection } from './_/components/support-section';
import { SuccessStoriesSection } from './_/components/success-stories-section';
import { CallToActionSection } from './_/components/cta-section';
import PageSkeleton from './loading';

export const metadata: Metadata = {
  title: 'Become an Instructor - Share Your Knowledge',
  description:
    'Join EduLearn as an instructor and start teaching millions of students worldwide. Create courses, earn money, and make an impact.',
  keywords: ['become instructor', 'teach online', 'create courses', 'earn money teaching'],
  openGraph: {
    title: 'Become an Instructor',
    description: 'Share your knowledge with millions of students worldwide',
    type: 'website',
  },
};

export default function BecomeInstructorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PageSkeleton />}>
        <main className="overflow-hidden">
          <BecomeInstructorHero />
          <StatsSection />
          <WhyTeachSection />
          <HowToBecomeSection />
          <RulesSection />
          <SupportSection />
          <SuccessStoriesSection />
          <CallToActionSection />
        </main>
      </Suspense>
    </div>
  );
}
