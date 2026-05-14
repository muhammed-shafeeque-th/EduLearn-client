import { Suspense } from 'react';

// Server Components
import StatsSection from './components/stats-section';
import CategoriesSection from './components/categories-section-cl';

// Loading Components
import {
  HeroSkeleton,
  StatsSkeleton,
  CategoriesSkeleton,
  CoursesSkeleton,
  InstructorsSkeleton,
  // TestimonialsSkeleton,
  // CTASkeleton,
} from './components/loading-skeletons';
import CoursesSection from './components/course-section-cl';
import InstructorsSection from './components/instructors-section-cl';
import TestimonialsSection from './components/testimonial-section';
import { CTASection } from './components/call-to-action-section';
import HeroSection from './components/hero-section-cl';

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
