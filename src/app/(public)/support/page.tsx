import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, CreditCard, Wrench, UserCog, ArrowRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { PageHero } from '@/components/layout/page-hero';
import { ROUTES } from '@/lib/constants/routes';

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: 'Help & Support Center',
  description:
    'Get help with courses, enrollment, billing, and technical issues. Browse guides by topic or contact the EduLearn support team directly.',
  path: ROUTES.public.support,
  keywords: ['EduLearn help center', 'EduLearn support', 'course troubleshooting'],
});

const TOPICS = [
  {
    icon: BookOpen,
    title: 'Courses & learning',
    description: 'Access, progress tracking, certificates, and course content.',
    href: `${ROUTES.public.faq}#courses`,
  },
  {
    icon: CreditCard,
    title: 'Billing & pricing',
    description: 'Payments, subscriptions, refunds, and invoices.',
    href: `${ROUTES.public.faq}#pricing`,
  },
  {
    icon: Wrench,
    title: 'Technical issues',
    description: 'Playback problems, browser support, and login trouble.',
    href: `${ROUTES.public.faq}#technical`,
  },
  {
    icon: UserCog,
    title: 'Account & enrollment',
    description: 'Managing your account, switching courses, and enrollment.',
    href: `${ROUTES.public.faq}#enrollment`,
  },
];

export default function SupportPage() {
  return (
    <main className="bg-[#F8F7F2] min-h-screen">
      <PageHero
        eyebrow="Help Center"
        title="How can we help?"
        description="Find a guide by topic, search the FAQ, or reach the support team directly — whichever gets you an answer fastest."
        breadcrumb={[
          { label: 'Home', path: ROUTES.public.home },
          { label: 'Support', path: ROUTES.public.support },
        ]}
      />

      <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TOPICS.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="group flex items-start gap-4 p-6 bg-white border border-[#14213D]/10 rounded-sm hover:border-[#A9812F]/50 transition-colors"
            >
              <topic.icon className="w-5 h-5 text-[#A9812F] shrink-0 mt-1" aria-hidden />
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold text-[#14213D] mb-1">
                  {topic.title}
                </h2>
                <p className="text-sm text-slate-600">{topic.description}</p>
              </div>
              <ArrowRight
                className="w-4 h-4 text-[#14213D]/30 group-hover:text-[#A9812F] group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#14213D]/10 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-14 md:py-20 text-center">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#A9812F]">
            Didn&rsquo;t find it?
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#14213D] mt-3 mb-4">
            Browse the full FAQ or write to us
          </h2>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              href={ROUTES.public.faq}
              className="px-6 py-3 rounded-sm bg-[#14213D] text-[#F8F7F2] text-sm font-medium hover:bg-[#14213D]/90 transition-colors"
            >
              Browse FAQ
            </Link>
            <Link
              href={ROUTES.public.contact}
              className="px-6 py-3 rounded-sm border border-[#14213D]/15 text-[#14213D] text-sm font-medium hover:border-[#A9812F] hover:text-[#A9812F] transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
