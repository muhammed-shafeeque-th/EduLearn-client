import { Suspense } from 'react';
import type { Metadata } from 'next';
import { InstructorPageSkeleton } from './[id]/_/components/skeletons/instructor-page-skeleton';
import InstructorsPageContent from './_/components/instructors-page-content';

export const metadata: Metadata = {
  title: 'Instructors | Find Top Teachers',
  description:
    'Browse and discover experienced instructors. Learn from the best teachers in various subjects on our platform.',
  keywords: [
    'instructors',
    'teachers',
    'find instructors',
    'teach online',
    'courses',
    'education',
    'experts',
    'browse teachers',
  ],
  openGraph: {
    title: 'Instructors - Discover Top Teachers',
    description:
      'Explore instructor profiles and find your next teacher or mentor on our platform.',
    type: 'website',
    url: '/instructors',
  },
};

export default async function InstructorsPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto py-4 md:py-8">
        <Suspense fallback={<InstructorPageSkeleton />}>
          <InstructorsPageContent />
        </Suspense>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl opacity-50" />
      </div>
    </main>
  );
}
