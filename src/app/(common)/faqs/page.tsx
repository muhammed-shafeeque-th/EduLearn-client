import { Metadata } from 'next';
import { FAQsPage } from './_/components/faq-page';
import { Suspense } from 'react';
import { FAQsSkeleton } from './_/components/skeletons/faq-skeleton';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Find answers to common questions about EduLearn courses, enrollment, pricing, and more.',
  keywords: 'EduLearn FAQ, questions, help, support, courses, enrollment',
};

export default function FAQs() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<FAQsSkeleton />}>
          <FAQsPage />
        </Suspense>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-3xl opacity-50" />
      </div>
    </main>
  );
}
