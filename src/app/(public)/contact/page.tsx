import { Metadata } from 'next';
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { buildMetadata, contactPageJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { PageHero } from '@/components/layout/page-hero';
import { ContactForm } from './components/contact-form';
import { ROUTES } from '@/lib/constants/routes';

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description:
    'Reach the EduLearn team by email or live chat. We reply to every message within one business day.',
  path: ROUTES.public.contact,
  keywords: ['contact EduLearn', 'EduLearn support email', 'EduLearn help'],
});

const CHANNELS = [
  {
    icon: Mail,
    title: 'Email',
    detail: 'support@edulearn.com',
    href: 'mailto:support@edulearn.com',
    note: 'Response within one business day',
  },
  {
    icon: MessageCircle,
    title: 'Live chat',
    detail: 'Available in-app',
    href: ROUTES.public.support,
    note: 'Weekdays, 8am–8pm ET',
  },
  {
    icon: MapPin,
    title: 'Office',
    detail: '148 Franklin Street, Boston, MA',
    note: 'By appointment only',
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#F8F7F2] min-h-screen">
      <JsonLd data={contactPageJsonLd()} />

      <PageHero
        eyebrow="Get in touch"
        title="Contact EduLearn"
        description="Questions about a course, a payment, or a partnership — send a message and a real person will reply."
        breadcrumb={[
          { label: 'Home', path: ROUTES.public.home },
          { label: 'Contact', path: ROUTES.public.contact },
        ]}
      />

      <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            {CHANNELS.map((channel) => (
              <div
                key={channel.title}
                className="flex gap-4 p-5 bg-white border border-[#14213D]/10 rounded-sm"
              >
                <channel.icon className="w-5 h-5 text-[#A9812F] shrink-0 mt-0.5" aria-hidden />
                <div>
                  <h2 className="font-display font-semibold text-[#14213D]">{channel.title}</h2>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="text-sm text-slate-600 hover:text-[#A9812F] transition-colors"
                    >
                      {channel.detail}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-600">{channel.detail}</p>
                  )}
                  <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400 mt-1">
                    {channel.note}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
