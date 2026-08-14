import Link from 'next/link';
import { breadcrumbJsonLd } from '../../lib/seo/json-ld';
import { JsonLd } from '../seo/json-ld';

export type BreadCrumbItem = { label: string; path: string };

/**
 * Renders the visible breadcrumb trail AND its BreadcrumbList JSON-LD from
 * the same `items` array — the visible UI and the structured data can never
 * disagree, which matters because Google will ignore/penalize schema that
 * doesn't match visible content.
 */
export function Breadcrumbs({ items }: { items: BreadCrumbItem[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {isLast ? (
                  <span aria-current="page" className="font-medium text-foreground">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:underline">
                    {item.label}
                  </Link>
                )}
                {!isLast && <span aria-hidden="true">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
