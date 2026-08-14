import Link from 'next/link';
import { Metadata } from 'next';
import { FAQ_DATA } from './_/data';
import { buildMetadata, faqPageJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { ROUTES } from '@/lib/constants/routes';
import { PageHero } from '../../../components/layout/page-hero';
import { FaqExplorer } from './_/components/faq-explorer';

// Static content today; revalidate hourly so this is ready to move to a
// CMS/DB-backed source later without changing the rendering strategy (ISR).
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about EduLearn courses, enrollment, pricing, certificates, and technical support.',
  path: ROUTES.public.faq,
  keywords: ['EduLearn FAQ', 'course enrollment help', 'EduLearn pricing', 'online course support'],
});

export default function FAQPage() {
  return (
    <main className="bg-[#F8F7F2] min-h-screen">
      <JsonLd
        data={faqPageJsonLd(FAQ_DATA.map(({ question, answer }) => ({ question, answer })))}
      />

      <PageHero
        eyebrow="Support Center"
        title="Frequently asked questions"
        description="Everything you need to know about courses, enrollment, pricing, and technical support — organized by category, or search directly."
        breadcrumb={[
          { label: 'Home', path: ROUTES.public.home },
          { label: 'FAQ', path: ROUTES.public.faq },
        ]}
      />

      <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        <FaqExplorer faqs={FAQ_DATA} />
      </section>

      <section className="border-t border-[#14213D]/10 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-14 md:py-20 text-center">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#A9812F]">
            Still stuck?
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#14213D] mt-3 mb-4">
            Our support team reads every message
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto mb-8">
            If the answer isn&rsquo;t above, reach the team directly and we&rsquo;ll get back to you
            within one business day.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={ROUTES.public.contact}
              className="px-6 py-3 rounded-sm bg-[#14213D] text-[#F8F7F2] text-sm font-medium hover:bg-[#14213D]/90 transition-colors"
            >
              Contact support
            </Link>
            <Link
              href={ROUTES.public.support}
              className="px-6 py-3 rounded-sm border border-[#14213D]/15 text-[#14213D] text-sm font-medium hover:border-[#A9812F] hover:text-[#A9812F] transition-colors"
            >
              Visit help center
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
