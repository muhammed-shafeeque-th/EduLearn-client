import { absoluteUrl } from '../constants/routes';
import { SITE_NAME } from '../constants';
import { config } from '../config';
import { Instructor } from '@/types/user';

const SITE_URL = config.siteUrl;

const WEBSITE_ID = `${SITE_URL}#website`;
const ORGANIZATION_ID = `${SITE_URL}#organization`;
const LOGO_ID = `${SITE_URL}#logo`;

const organizationRef = {
  '@id': ORGANIZATION_ID,
};

const websiteRef = {
  '@id': WEBSITE_ID,
};

/** BreadcrumbList structured data — pass the same items rendered by <Breadcrumbs />. */
export function breadcrumbJsonLd(items: { label: string; path: string }[]) {
  const lastPath = items[items.length - 1]?.path ?? '/';
  const breadcrumbId = `${absoluteUrl(lastPath)}#breadcrumb`;

  return {
    '@context': 'https://schema.org',
    '@id': breadcrumbId,

    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * FAQPage structured data.
 *
 * Use only when the FAQ questions and answers are actually
 * visible on the page.
 *
 * Note: FAQ structured data does not guarantee a Google rich result.
 */
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
 * Global EduLearn identity graph.
 *
 * Include this on the public homepage.
 *
 * Defines:
 * - WebSite
 * - Organization
 * - Logo
 *
 * All other page-level JSON-LD can reference these entities
 * using their stable @id values.
 */
export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: 'EduLearn Online Learning Platform',
        description:
          'EduLearn is an online learning platform offering practical courses in software development and technology.',
        publisher: organizationRef,
      },

      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          '@id': LOGO_ID,
          url: absoluteUrl('/logo.png'),
          contentUrl: absoluteUrl('/logo.png'),
        },
        sameAs: [
          'https://github.com/muhammed-shafeeque-th',
          'https://instagram.com/web-edulearn',
          'https://facebook.com/edulearn',
          'https://twitter.com/edulearn',
          'https://linkedin.com/company/edulearn',
        ],
      },
    ],
  };
}

/** ContactPage structured data. */
export function contactPageJsonLd() {
  const url = absoluteUrl('/contact');

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${url}#webpage`,
    name: `Contact ${SITE_NAME}`,
    url,

    isPartOf: websiteRef,
    about: organizationRef,
  };
}
/** About Page structured data. */
export function aboutPageJsonLd() {
  const url = absoluteUrl('/about');

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${url}#webpage`,
    name: `About ${SITE_NAME}`,
    url,

    isPartOf: websiteRef,
    mainEntity: organizationRef,
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
  const url = absoluteUrl(`/courses/${course.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    '@id': `${url}#course`,
    url,

    description: course.description,
    provider: organizationRef,
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
  };
}

/** Person structured data for instructor profile pages. */
export function personJsonLd(instructor: Instructor) {
  const url = absoluteUrl(`/instructors/${instructor.id}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${url}#person`,

    name: instructor.username,
    url,

    ...(instructor.instructorProfile?.headline
      ? {
          jobTitle: instructor.instructorProfile.headline,
        }
      : {}),

    ...(instructor.instructorProfile?.bio
      ? {
          description: instructor.instructorProfile.bio,
        }
      : {}),

    ...(instructor.avatar
      ? {
          image: absoluteUrl(instructor.avatar),
        }
      : {}),

    ...(instructor.socials?.length
      ? {
          sameAs: instructor.socials.map((s) => s.profileUrl),
        }
      : {}),

    worksFor: organizationRef,
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
  authorUrl?: string;
}) {
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,

    headline: post.title,
    description: post.excerpt,
    url,

    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
    },

    author: {
      '@type': 'Person',
      name: post.authorName,
      ...(post.authorUrl
        ? {
            url: absoluteUrl(post.authorUrl),
          }
        : {}),
    },

    publisher: organizationRef,

    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,

    ...(post.coverImageUrl
      ? {
          image: [absoluteUrl(post.coverImageUrl)],
        }
      : {}),
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
export function blogListJsonLd(
  posts: {
    title: string;
    path: string;
    publishedAt: string;
  }[]
) {
  const url = absoluteUrl('/blog');

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,

    name: `${SITE_NAME} Blog`,
    url,

    isPartOf: websiteRef,

    mainEntity: {
      '@type': 'ItemList',
      '@id': `${url}#itemlist`,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: absoluteUrl(post.path),
      })),
    },
  };
}

export function becomeInstructorPageJsonLd() {
  const url = absoluteUrl('/become-instructor');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: 'Become an Instructor | Teach on EduLearn',
        description:
          'Join EduLearn as an instructor and share your knowledge with learners. Learn about instructor benefits, requirements, and how to start teaching on EduLearn.',

        isPartOf: websiteRef,
        about: organizationRef,

        breadcrumb: {
          '@id': `${url}#breadcrumb`,
        },
      },

      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Become an Instructor',
            item: url,
          },
        ],
      },
    ],
  };
}
