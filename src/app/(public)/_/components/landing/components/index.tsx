import { Suspense } from 'react';

// Server Components
import StatsSection from './stats-section';
import CategoriesSection from './categories-section';

// Loading Components
import {
  HeroSkeleton,
  StatsSkeleton,
  CategoriesSkeleton,
  CoursesSkeleton,
  InstructorsSkeleton,
  // TestimonialsSkeleton,
  // CTASkeleton,
} from './loading-skeletons';
import CoursesSection from './course-section';
import InstructorsSection from './instructors-section';
import TestimonialsSection from './testimonial-section';
import { CTASection } from './call-to-action-section';
import HeroSection from './hero-section';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>

      <Suspense fallback={<CoursesSkeleton />}>
        <CoursesSection />
      </Suspense>

      <Suspense fallback={<InstructorsSkeleton />}>
        <InstructorsSection />
      </Suspense>

      <Suspense
        fallback={
          <div>Loading...</div>
          // <TestimonialsSkeleton />
        }
      >
        <TestimonialsSection />
      </Suspense>

      <Suspense
        fallback={
          <div>Loading...</div>
          // <CTASkeleton />
        }
      >
        <CTASection />
      </Suspense>
    </main>
  );
}
