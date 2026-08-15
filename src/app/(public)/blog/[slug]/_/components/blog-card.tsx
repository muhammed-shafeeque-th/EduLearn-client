import { ROUTES } from '@/lib/constants/routes';
import Link from 'next/link';
import { BlogPost } from '../data/blog-data';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <Link href={ROUTES.public.blogPost(post.slug)} className="group block border-b py-8 first:pt-0">
      <div className="flex gap-5">
        <span className="text-xs font-bold text-primary pt-1.5 shrink-0 w-6">
          {String(index).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
              {post.category}
            </span>
            <time dateTime={post.publishedAt} className="text-xs text-muted-foreground">
              {formatDate(post.publishedAt)}
            </time>
            <span className="text-muted-foreground/40">&middot;</span>
            <span className="text-xs text-muted-foreground">{post.readingMinutes} min read</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {post.description}
          </p>

          <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary">
            Read article
            <svg
              viewBox="0 0 12 8"
              className="w-3 h-3 -rotate-90 group-hover:translate-x-0.5 transition-transform"
              aria-hidden
            >
              <path
                d="M1 1l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
