import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { articleJsonLd } from '@/lib/seo/json-ld';
import { JsonLd } from '@/components/seo/json-ld';
import { BLOG_POSTS, getBlogPost } from './_/data/blog-data';
import { buildMetadata } from '@/lib/seo';
import { ROUTES } from '@/lib/constants/routes';
import { BlogCard } from './_/components/blog-card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-renders every post to static HTML at build time (true SSG). New posts
// added to BLOG_POSTS get picked up on the next build; revalidate below
// covers edits to existing posts without a full redeploy once this is
// backed by a CMS.
export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = getBlogPost(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: ROUTES.public.blogPost(post.slug),
    keywords: [post.category, 'EduLearn blog'],
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="bg-[#F8F7F2] min-h-screen">
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.description,
          path: ROUTES.public.blogPost(post.slug),
          author: post.author,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
        })}
      />

      <header className="border-b border-[#14213D]/10 bg-[#F8F7F2]">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-14 md:pt-14 md:pb-16">
          <Breadcrumbs
            items={[
              { label: 'Home', path: ROUTES.public.home },
              { label: 'Blog', path: ROUTES.public.blog },
              { label: post.title, path: ROUTES.public.blogPost(post.slug) },
            ]}
          />

          <div className="mt-8 flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-[#A9812F]" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#A9812F]">
              {post.category}
            </span>
          </div>

          <h1 className="font-display mt-4 text-3xl md:text-5xl font-semibold text-[#14213D] leading-[1.15]">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
            <span>{post.author}</span>
            <span className="text-[#14213D]/20">&middot;</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span className="text-[#14213D]/20">&middot;</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        {post.body.map((block, index) => (
          <section key={index} className="mb-8 last:mb-0">
            {block.heading && (
              <h2 className="font-display text-xl md:text-2xl font-semibold text-[#14213D] mb-3">
                {block.heading}
              </h2>
            )}
            {block.paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex} className="text-base text-slate-600 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div className="mt-12 pt-8 border-t border-[#14213D]/10">
          <Link
            href={ROUTES.public.blog}
            className="text-sm font-medium text-[#14213D] hover:text-[#A9812F] transition-colors"
          >
            &larr; Back to all articles
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-[#14213D]/10 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-14 md:py-16">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#A9812F]">
              Keep reading
            </span>
            <div className="mt-6">
              {related.map((relatedPost, index) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} index={index + 1} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
