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
    detail: 'Karuvarakundu town 676525 , Malappuram, Kerala, India',
    note: 'By appointment only',
  },
];

export default function ContactPage() {
  return (
    <main className="bg-background min-h-screen">
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
                className="flex gap-4 p-5 bg-card border rounded-2xl shadow-sm"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <channel.icon className="w-5 h-5 text-primary" aria-hidden />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{channel.title}</h2>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {channel.detail}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{channel.detail}</p>
                  )}
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70 mt-1">
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
