import { Metadata } from 'next';
import { buildMetadata, blogListJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { PageHero } from '@/components/layout/page-hero';
import { ROUTES } from '@/lib/constants/routes';
import { BLOG_POSTS } from './[slug]/_/data/blog-data';
import { BlogCard } from './[slug]/_/components/blog-card';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description:
    'Practical guidance on choosing courses, learning formats, and turning certificates into career outcomes — from the EduLearn team.',
  path: ROUTES.public.blog,
  keywords: ['EduLearn blog', 'online learning advice', 'career guidance'],
});

export default function BlogIndexPage() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <main className="bg-[#F8F7F2] min-h-screen">
      <JsonLd
        data={blogListJsonLd(
          sorted.map((post) => ({
            title: post.title,
            path: ROUTES.public.blogPost(post.slug),
            publishedAt: post.publishedAt,
          }))
        )}
      />

      <PageHero
        eyebrow="Journal"
        title="Notes on learning and careers"
        description="Straight answers on course formats, certificates, and how to actually get hired — no filler."
        breadcrumb={[
          { label: 'Home', path: ROUTES.public.home },
          { label: 'Blog', path: ROUTES.public.blog },
        ]}
      />

      <section className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        {sorted.map((post, index) => (
          <BlogCard key={post.slug} post={post} index={index + 1} />
        ))}
      </section>
    </main>
  );
}
