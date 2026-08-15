import Link from 'next/link';
import { Metadata } from 'next';
import { FAQ_DATA } from './_/data';
import { buildMetadata, faqPageJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { ROUTES } from '@/lib/constants/routes';
import { PageHero } from '@/components/layout/page-hero';
import { FaqExplorer } from './_/components/faq-explorer';

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
    <main className="bg-background min-h-screen">
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

      <section className="border-t bg-card">
        <div className="max-w-4xl mx-auto px-6 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            Still stuck?
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-4 mb-4">
            Our support team reads every message
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            If the answer isn&rsquo;t above, reach the team directly and we&rsquo;ll get back to you
            within one business day.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={ROUTES.public.contact}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Contact support
            </Link>
            <Link
              href={ROUTES.public.support}
              className="px-6 py-3 rounded-xl border text-foreground text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Visit help center
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
