import { absoluteUrl } from '../constants/routes';
import { SITE_NAME } from '../constants';
import { config } from '../config';
import { Instructor } from '@/types/user';

/** BreadcrumbList structured data — pass the same items rendered by <Breadcrumbs />. */
export function breadcrumbJsonLd(items: { label: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.path),
    })),
  };
}

/** FAQPage structured data — powers the rich "People also ask" search result. */
export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Organization structured data — include ONCE sitewide (root layout is the
 * usual spot), not per-page. Duplicating it on every page adds no value and
 * bloats the DOM.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: config.siteUrl,
    logo: absoluteUrl('/logo.png'),
    sameAs: [
      'https://github.com/muhammed-shafeeque-th',
      'https://instagram.com/web-edulearn',
      'https://facebook.com/edulearn',
      'https://twitter.com/edulearn',
      'https://linkedin.com/company/edulearn',
    ],
  };
}

/**
 * WebSite structured data with a SearchAction — this is what unlocks the
 * "sitelinks search box" under your result on Google. Include once, same
 * place as organizationJsonLd (root layout).
 */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: config.siteUrl,
    alternateName: 'EduLearn Online Learning Platform',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.siteUrl}/courses?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** ContactPage structured data. */
export function contactPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE_NAME}`,
    url: absoluteUrl('/contact'),
  };
}

/**
 * Course structured data — this is the highest-value schema on the whole
 * site. It's the difference between a plain blue link and a rich result with
 * rating stars, price, and provider badge. Google requires `provider` and
 * either `hasCourseInstance` or `offers` to be eligible for the rich result.
 */
export function courseJsonLd(course: {
  title: string;
  description: string;
  slug: string;
  instructorName: string;
  price?: number;
  currency?: string;
  ratingValue?: number;
  ratingCount?: number;
  durationISO8601?: string; // e.g. 'P4W' for 4 weeks
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  language?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: absoluteUrl(`/courses/${course.slug}`),
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      sameAs: config.siteUrl,
    },
    ...(course.instructorName
      ? { instructor: { '@type': 'Person', name: course.instructorName } }
      : {}),
    ...(course.level ? { educationalLevel: course.level } : {}),
    inLanguage: course.language ?? 'en',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      ...(course.durationISO8601 ? { duration: course.durationISO8601 } : {}),
    },
    ...(course.price !== undefined
      ? {
          offers: {
            '@type': 'Offer',
            price: course.price,
            priceCurrency: course.currency ?? 'USD',
            availability: 'https://schema.org/InStock',
            url: absoluteUrl(`/courses/${course.slug}`),
          },
        }
      : {}),
    ...(course.ratingValue && course.ratingCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: course.ratingValue,
            ratingCount: course.ratingCount,
          },
        }
      : {}),
  };
}

/** Person structured data for instructor profile pages. */
export function personJsonLd(instructor: Instructor) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: instructor.username,
    url: absoluteUrl(`/instructors/${instructor.id}`),
    jobTitle: instructor.instructorProfile?.headline,
    ...(instructor.instructorProfile?.bio
      ? { description: instructor.instructorProfile?.bio }
      : {}),
    ...(instructor.avatar ? { image: absoluteUrl(instructor.avatar) } : {}),
    ...(instructor.socials?.length ? { sameAs: instructor.socials.map((s) => s.profileUrl) } : {}),
    worksFor: { '@type': 'EducationalOrganization', name: SITE_NAME },
  };
}

/** BlogPosting structured data for blog posts. */
export function blogPostingJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  coverImageUrl?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/blog/${post.slug}`),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Person', name: post.authorName },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    },
    ...(post.coverImageUrl ? { image: absoluteUrl(post.coverImageUrl) } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/blog/${post.slug}`) },
  };
}

/**
 * ItemList structured data for listing/collection pages (course catalog,
 * instructor directory). Helps Google understand the page is a curated
 * collection and can improve how listing pages surface in search.
 */
export function itemListJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/** Article structured data for a single blog post — powers article rich results. */
export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(input.path) },
    author: { '@type': 'Organization', name: input.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    },
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    image: absoluteUrl(input.image ?? '/blog/opengraph-image.png'),
  };
}

/** Blog listing structured data — an ItemList of the posts shown on /blog. */
export function blogListJsonLd(posts: { title: string; path: string; publishedAt: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Blog`,
    url: absoluteUrl('/blog'),
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: absoluteUrl(post.path),
      datePublished: post.publishedAt,
    })),
  };
}
