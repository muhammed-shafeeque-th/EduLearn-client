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
import { becomeInstructorPageJsonLd, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = buildMetadata({
  title: 'Become an Instructor - Share Your Knowledge',
  description:
    'Join EduLearn as an instructor and start teaching millions of students worldwide. Create courses, earn money, and make an impact.',
  path: '/become-instructor',
  keywords: [
    'become an instructor',
    'teach online',
    'online instructor',
    'teach on EduLearn',
    'EduLearn instructor',
  ],
  index: true,
  og: {
    title: 'Become an Instructor',
    description: 'Share your knowledge with millions of students worldwide',
    image: '/og/og-become-instructor.jpg',
  },
});

export default function BecomeInstructorPage() {
  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={becomeInstructorPageJsonLd()} />
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
