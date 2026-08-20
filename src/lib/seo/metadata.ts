import { Metadata } from 'next';
import { absoluteUrl } from '../constants/routes';
import { SITE_NAME } from '../constants';
import { config } from '../config';
import { Instructor } from '@/types/user';

const TITLE_MAX = 60; // Google truncates around here in SERPs
const DESC_MAX = 160;

interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Set false for utility/legal pages, or pages you don't want indexed yet. */
  index?: boolean;
  /** Set false to stop crawlers from following links out of the page (rare — e.g. thin filter pages). */
  follow?: boolean;
  ogImage?: string;
  /** 'website' for most pages, 'article' for blog posts. */
  ogType?: 'website' | 'article';
  article?: {
    publishedTime: string; // ISO 8601
    modifiedTime?: string;
    author: string;
    tags?: string[];
  };
}

function truncate(str: string, max: number) {
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str;
}

/**
 * Build a consistent Metadata object: title template, canonical URL,
 * Open Graph + Twitter cards, and robots directives.
 *
 * Usage in a page.tsx:
 *   export const metadata = buildMetadata({
 *     title: 'Frequently Asked Questions',
 *     description: '...',
 *     path: ROUTES.public.faq,
 *   });
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
  follow = true,
  ogImage = '/og/default.png',
  ogType = 'website',
  article,
}: PageSeoInput): Metadata {
  const url = absoluteUrl(path);
  const safeTitle = truncate(title, TITLE_MAX);
  const safeDescription = truncate(description, DESC_MAX);
  const fullTitle = `${safeTitle}`;

  return {
    title: fullTitle,
    description: safeDescription,
    keywords: keywords?.join(', '),
    alternates: { canonical: url },
    robots: {
      index: index && follow,
      follow,
      googleBot: {
        index,
        follow,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: fullTitle,
      description: safeDescription,
      url,
      siteName: SITE_NAME,
      type: ogType,
      locale: 'en_US',
      images: [{ url: absoluteUrl(ogImage), width: 1200, height: 630, alt: safeTitle }],
      ...(ogType === 'article' && article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime ?? article.publishedTime,
            authors: [article.author],
            tags: article.tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: safeDescription,
      images: [absoluteUrl(ogImage)],
      site: config.twitterHandle, // e.g. '@edulearn'
    },
    // Only meaningful once you actually verify with these consoles — drop the ones you don't use.
    verification: {
      google: config.googleSiteVerification,
    },
  };
}

/**
 * Course detail page metadata. Pulls the OG image from the course thumbnail
 * and folds category/level into keywords automatically.
 */
export function buildCourseMetadata(course: {
  title: string;
  shortDescription: string;
  slug: string;
  thumbnailUrl?: string;
  category?: string;
  level?: string;
  instructorName?: string;
}): Metadata {
  return buildMetadata({
    title: course.title,
    description: course.shortDescription,
    path: `/courses/${course.slug}`,
    keywords: [course.category, course.level, course.instructorName, 'online course'].filter(
      Boolean
    ) as string[],
    ogImage: course.thumbnailUrl ?? '/og/default-course.png',
  });
}

/** Instructor profile page metadata. */
export function buildInstructorMetadata(instructor: Instructor): Metadata {
  const instructorName = instructor.username || instructor.firstName + instructor.lastName;
  return buildMetadata({
    title: `${instructorName} — ${instructor.instructorProfile?.headline}`,
    description: `Learn from ${instructorName}: ${instructor.instructorProfile?.headline}.`,
    path: `/instructors/${instructor.id}`,
    keywords: instructor.instructorProfile?.tags,
    ogImage: instructor.avatar ?? '/og/default-instructor.png',
  });
}

/** Blog post metadata — sets ogType: 'article' and the article-specific OG fields. */
export function buildBlogPostMetadata(post: {
  title: string;
  excerpt: string;
  slug: string;
  coverImageUrl?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  tags?: string[];
}): Metadata {
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
    ogImage: post.coverImageUrl ?? '/og/default-blog.png',
    ogType: 'article',
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      author: post.authorName,
      tags: post.tags,
    },
  });
}

/**
 * Listing / search / filter pages (e.g. /courses?category=design&page=2).
 * Google explicitly recommends noindex,follow over rel=next/prev (deprecated)
 * for paginated or filtered variants — the canonical still points at the
 * clean root so link equity consolidates there.
 */
export function buildListingMetadata({
  title,
  description,
  path,
  index,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  return buildMetadata({
    title,
    description,
    path,
    index: !!index,
    follow: true,
  });
}
