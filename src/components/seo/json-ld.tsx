/**
 * Server component. Injects a <script type="application/ld+json"> tag.
 * JSON.stringify + the </script> escape below prevents any chance of the
 * payload breaking out of the script tag if data ever comes from user input.
 *
 * Render as many of these as you need on a page — Google is fine with
 * multiple JSON-LD blocks (e.g. Course + BreadcrumbList on the same page).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
