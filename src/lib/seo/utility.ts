import { Metadata } from 'next';
import { absoluteUrl } from '../constants/routes';
import { SITE_NAME } from '../constants';

interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Set false for utility/legal pages you don't want indexed yet (e.g. staging). */
  index?: boolean;
  ogImage?: string;
}

/**
 * Build a consistent Metadata object: title template, canonical URL,
 * Open Graph + Twitter cards, and robots directives.
 *
 * Usage in a page.tsx:
 *   export const metadata = buildMetadata({
 *     title: 'Frequently Asked Questions',
 *     description: '...',
 *     path: ROUTES.faq,
 *   });
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
  ogImage = '/og/default.png',
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: keywords?.join(', '),
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: absoluteUrl(ogImage), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [absoluteUrl(ogImage)],
    },
  };
}
