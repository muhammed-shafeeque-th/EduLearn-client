import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { articleJsonLd, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { BLOG_POSTS, getBlogPost } from './_/data/blog-data';
import { ROUTES } from '@/lib/constants/routes';
import { BlogCard } from './_/components/blog-card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
    <main className="bg-background min-h-screen">
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

      <header className="border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-14 md:pt-14 md:pb-16">
          <Breadcrumbs
            items={[
              { label: 'Home', path: ROUTES.public.home },
              { label: 'Blog', path: ROUTES.public.blog },
              { label: post.title, path: ROUTES.public.blogPost(post.slug) },
            ]}
          />

          <span className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {post.category}
          </span>

          <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{post.author}</span>
            <span className="text-muted-foreground/30">&middot;</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span className="text-muted-foreground/30">&middot;</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        {post.body.map((block, index) => (
          <section key={index} className="mb-8 last:mb-0">
            {block.heading && (
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                {block.heading}
              </h2>
            )}
            {block.paragraphs.map((paragraph, pIndex) => (
              <p
                key={pIndex}
                className="text-base text-muted-foreground leading-relaxed mb-4 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div className="mt-12 pt-8 border-t">
          <Link
            href={ROUTES.public.blog}
            className="text-sm font-medium text-primary hover:underline"
          >
            &larr; Back to all articles
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t bg-card">
          <div className="max-w-3xl mx-auto px-6 py-14 md:py-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
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
