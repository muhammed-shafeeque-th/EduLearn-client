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
    <Link
      href={ROUTES.public.blogPost(post.slug)}
      className="group block border-b border-[#14213D]/10 py-8 first:pt-0"
    >
      <div className="flex gap-5">
        <span className="font-mono text-xs text-[#A9812F] pt-1.5 shrink-0 w-6">
          {String(index).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wide text-[#A9812F]">
              {post.category}
            </span>
            <span className="text-[#14213D]/20">&middot;</span>
            <time dateTime={post.publishedAt} className="text-xs text-slate-500">
              {formatDate(post.publishedAt)}
            </time>
            <span className="text-[#14213D]/20">&middot;</span>
            <span className="text-xs text-slate-500">{post.readingMinutes} min read</span>
          </div>

          <h2 className="font-display text-xl md:text-2xl font-semibold text-[#14213D] leading-snug group-hover:text-[#A9812F] transition-colors">
            {post.title}
          </h2>

          <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl">
            {post.description}
          </p>

          <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[#14213D] group-hover:text-[#A9812F] transition-colors">
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
