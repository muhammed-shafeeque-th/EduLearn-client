// This is a SNIPPET to merge into your existing app/layout.tsx — not a
// standalone file. It shows the two things that belong sitewide, once, and
// should never be duplicated per-page.

import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import { config } from '@/lib/config';
import { JsonLd } from './json-ld';
import { siteJsonLd } from '@/lib/seo';

// Sitewide default metadata. Individual pages override title/description via
// buildMetadata(); metadataBase makes every relative OG/Twitter image
// resolve correctly without you having to pass absolute URLs everywhere.
export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: 'Learn in-demand skills with expert-led online courses.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Sitewide structured data — render once here, never on individual pages */}
        <JsonLd data={siteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
