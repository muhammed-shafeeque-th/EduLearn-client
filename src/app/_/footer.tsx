'use client';

import { Facebook, Twitter, Github } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { GoogleIcon, MicrosoftIcon } from '@/components/icons';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  if (!currentYear) return null; // Prevent SSR/client mismatch

  return (
    <footer className="w-full bg-slate-800 text-slate-300 font-inter">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-wrap gap-y-12 gap-x-8 md:flex-nowrap md:justify-between md:items-start">
        {/* Company Info */}
        <section className="flex flex-col gap-4 flex-1 min-w-[220px]">
          <div className="flex items-center gap-3 mb-2">
            <Logo />
            <span className="text-xl font-semibold text-white">EduLearn</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-300 max-w-xs">
            Empowering learners through accessible and engaging online education. EduLearn is Link
            leading online learning platform dedicated to providing high-quality, flexible, and
            affordable educational experiences.
          </p>
        </section>
        {/* Get Help */}
        <nav aria-label="Get Help" className="flex flex-col gap-2 flex-1 min-w-[120px]">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Get Help</h3>
          <Link
            href="/contact"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Contact Us
          </Link>
          <Link
            href="/articles"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Latest Articles
          </Link>
          <Link
            href="/faqs"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            FAQS
          </Link>
        </nav>
        {/* Programs */}
        <nav aria-label="Programs" className="flex flex-col gap-2 flex-1 min-w-[120px]">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Programs</h3>
          <Link
            href="/programs/art-design"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Art & Design
          </Link>
          <Link
            href="/programs/business"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Business
          </Link>
          <Link
            href="/programs/it-software"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            IT & Software
          </Link>
          <Link
            href="/programs/languages"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Languages
          </Link>
          <Link
            href="/programs/programming"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Programming
          </Link>
        </nav>
        {/* Contact Us */}
        <address className="not-italic flex flex-col gap-4 flex-1 min-w-[220px]">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-1">Contact Us</h3>
            <p className="text-sm font-medium">Address: 123 Main Street, Anytown, CA 12345</p>
            <p className="text-sm font-medium">
              Tel:{' '}
              <Link
                href="tel:+91 9744491844"
                className="hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                +(91) 9744491844
              </Link>
            </p>
            <p className="text-sm font-medium">
              Mail:{' '}
              <Link
                href="mailto:edulearn@webkul.in"
                className="hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                edulearn@webkul.in
              </Link>
            </p>
          </div>
          <div className="flex gap-4 mt-2">
            <Link
              href="https://facebook.com"
              aria-label="Facebook"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Facebook />
            </Link>
            <Link
              href="https://twitter.com"
              aria-label="Twitter"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-sky-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Twitter />
            </Link>
            <Link
              href="https://google.com"
              aria-label="Google"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GoogleIcon />
            </Link>
            <Link
              href="https://github.com"
              aria-label="Github"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github />
            </Link>
            <Link
              href="https://microsoft.com"
              aria-label="Microsoft"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-blue-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              rel="noopener noreferrer"
              target="_blank"
            >
              <MicrosoftIcon />
            </Link>
          </div>
        </address>
      </div>
      <div className="border-t border-slate-700 w-full mt-8" />
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm font-medium">© {currentYear} EduLearn, Inc.</span>
        <nav aria-label="Legal" className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm font-medium hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
