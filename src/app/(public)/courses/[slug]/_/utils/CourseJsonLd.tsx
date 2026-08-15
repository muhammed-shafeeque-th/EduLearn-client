import { Course } from '@/types/course';
import { config } from '@/lib/config';
import { ROUTES } from '@/lib/constants/routes';

/** Ensures a URL is absolute — course.thumbnail/instructor.avatar may come back as CDN-relative paths. */
function toAbsoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${config.siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/**
 * Converts { durationValue, durationUnit } into a valid ISO 8601 duration.
 * The original code did `PT${value + value}` — no unit suffix (invalid ISO
 * 8601) and doubled the number. This handles the common edtech units;
 * extend the map if your data has others.
 */
function toIso8601Duration(value?: number, unit?: string): string | undefined {
  if (!value || value <= 0) return undefined;
  const normalized = (unit ?? '').toLowerCase();

  if (normalized.startsWith('hour')) return `PT${value}H`;
  if (normalized.startsWith('minute')) return `PT${value}M`;
  if (normalized.startsWith('day')) return `P${value}D`;
  if (normalized.startsWith('week')) return `P${value}W`;
  if (normalized.startsWith('month')) return `P${value}M`;

  // Unknown unit: fail safe rather than emit malformed structured data.
  return undefined;
}

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

export default function CourseJsonLd({ course }: { course: Course }) {
  const courseUrl = `${config.siteUrl}${ROUTES.public.courses.course(course.slug)}`;
  const instructorUrl = `${config.siteUrl}${ROUTES.public.instructors.profile(course.instructor.id)}`;
  const timeRequired = toIso8601Duration(course.durationValue, course.durationUnit);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description ? truncateAtWord(course.description, 300) : undefined,
    url: courseUrl,

    provider: {
      '@type': 'EducationalOrganization',
      name: 'EduLearn',
      url: config.siteUrl,
    },

    instructor: {
      '@type': 'Person',
      name: course.instructor.name,
      // Bug fix: this was set to the instructor's avatar image, which is
      // semantically wrong — `url` should be the entity's page; the image
      // belongs in `image`.
      url: instructorUrl,
      image: toAbsoluteUrl(course.instructor.avatar),
    },

    ...(course.level ? { educationalLevel: course.level } : {}),
    inLanguage: course.language || 'en',

    ...(timeRequired ? { timeRequired } : {}),

    image: toAbsoluteUrl(course.thumbnail),

    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      ...(timeRequired ? { duration: timeRequired } : {}),
    },

    // Bug fix: Google's structured data guidelines flag aggregateRating
    // blocks with zero reviews as invalid — only emit it when there's
    // real data behind it.
    ...(course.rating && course.totalRatings
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: course.rating,
            reviewCount: course.totalRatings,
          },
        }
      : {}),

    ...(course.price !== undefined && course.price !== null
      ? {
          offers: {
            '@type': 'Offer',
            price: course.price,
            priceCurrency: course.currency || 'USD',
            availability: 'https://schema.org/InStock',
            url: courseUrl,
          },
        }
      : {}),

    dateModified: course.updatedAt ? new Date(course.updatedAt).toISOString() : undefined,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: config.siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Courses',
        item: `${config.siteUrl}${ROUTES.public.courses.root}`,
      },
      { '@type': 'ListItem', position: 3, name: course.title, item: courseUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify drops `undefined` keys automatically, so the
        // optional fields above don't need manual cleanup.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </>
  );
}
