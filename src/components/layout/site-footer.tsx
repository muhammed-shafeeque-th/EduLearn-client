import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { ROUTES } from '@/lib/constants/routes';

const CURRENT_YEAR = new Date().getFullYear();

const PROGRAMS = [
  { label: 'Art & Design', href: `${ROUTES.public.courses.root}?category=art-design` },
  { label: 'Business', href: `${ROUTES.public.courses.root}?category=business` },
  { label: 'IT & Software', href: `${ROUTES.public.courses.root}?category=it-software` },
  { label: 'Languages', href: `${ROUTES.public.courses.root}?category=languages` },
  { label: 'Programming', href: `${ROUTES.public.courses.root}?category=programming` },
];

const SOCIALS = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

const linkClass =
  'text-sm text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm';

export default function SiteFooter() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-wrap gap-y-12 gap-x-8 md:flex-nowrap md:justify-between md:items-start">
        {/* Company info */}
        <section className="flex flex-col gap-4 flex-1 min-w-[240px] max-w-sm">
          <Link
            href={ROUTES.public.home}
            aria-label="EduLearn home"
            className="inline-flex items-center gap-2.5"
          >
            <Logo />
          </Link>
          <p className="text-sm leading-relaxed text-slate-400">
            EduLearn is a leading online learning platform dedicated to accessible, engaging, and
            affordable education &mdash; taught by people still working in the field.
          </p>
        </section>

        {/* Get help */}
        <nav aria-label="Get help" className="flex flex-col gap-2.5 flex-1 min-w-[130px]">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1.5">
            Get Help
          </h3>
          <Link href={ROUTES.public.contact} className={linkClass}>
            Contact Us
          </Link>
          <Link href={ROUTES.public.blog} className={linkClass}>
            Latest Articles
          </Link>
          <Link href={ROUTES.public.faq} className={linkClass}>
            FAQ
          </Link>
          <Link href={ROUTES.public.support} className={linkClass}>
            Help Center
          </Link>
        </nav>

        {/* Programs */}
        <nav aria-label="Programs" className="flex flex-col gap-2.5 flex-1 min-w-[150px]">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1.5">
            Programs
          </h3>
          {PROGRAMS.map((program) => (
            <Link key={program.label} href={program.href} className={linkClass}>
              {program.label}
            </Link>
          ))}
        </nav>

        {/* Contact */}
        <address className="not-italic flex flex-col gap-4 flex-1 min-w-[240px]">
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-1.5">
              Contact Us
            </h3>
            <p className="text-sm text-slate-400"> Karuvarakundu town, Malappuram, Kerala, India</p>
            <p className="text-sm text-slate-400">
              Tel:{' '}
              <a href="tel:+16175550148" className={linkClass}>
                +91 9744491844
              </a>
            </p>
            <p className="text-sm text-slate-400">
              Mail:{' '}
              <a href="mailto:support@edulearn.com" className={linkClass}>
                support@edulearn.com
              </a>
            </p>
          </div>

          <ul className="flex gap-2.5 mt-1">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-700 hover:border-primary hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <Icon className="w-4 h-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </address>
      </div>

      <div className="border-t border-slate-800 w-full" />

      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-xs text-slate-500">&copy; {CURRENT_YEAR} EduLearn, Inc.</span>
        <nav aria-label="Legal" className="flex items-center gap-6">
          <Link href={ROUTES.public.privacy} className={linkClass}>
            Privacy Policy
          </Link>
          <Link href={ROUTES.public.terms} className={linkClass}>
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
