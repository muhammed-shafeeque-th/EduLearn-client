'use client';

import { useMemo, useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { FAQ, FAQ_CATEGORIES, FaqCategoryId } from '../data';
import { FaqItem } from './faq-item';
import { cn } from '@/lib/utils';

/**
 * This is the ONLY client component in the FAQ page. It receives the full,
 * already-rendered FAQ list as a prop — the same data is server-rendered by
 * the parent page, so search engines see every question and answer in the
 * initial HTML regardless of whether this island hydrates.
 *
 * Filtering hides non-matching items with the `hidden` attribute instead of
 * removing them from the tree, so open <details> state and layout stay
 * stable and there is no client-side data fetch or fake loading delay.
 */
export function FaqExplorer({ faqs }: { faqs: FAQ[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FaqCategoryId | 'all'>('all');

  const normalizedQuery = query.trim().toLowerCase();

  const visibility = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const faq of faqs) {
      const matchesCategory = category === 'all' || faq.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        faq.question.toLowerCase().includes(normalizedQuery) ||
        faq.answer.toLowerCase().includes(normalizedQuery);
      map.set(faq.id, matchesCategory && matchesQuery);
    }
    return map;
  }, [faqs, category, normalizedQuery]);

  const visibleCount = [...visibility.values()].filter(Boolean).length;

  return (
    <div>
      {/* Search */}
      <div className="max-w-xl mx-auto relative mb-10">
        <div className="relative flex items-center bg-white border border-[#14213D]/15 rounded-sm overflow-hidden focus-within:border-[#A9812F] transition-colors">
          <Search className="ml-4 text-[#14213D]/40 w-4 h-4 shrink-0" aria-hidden />
          <input
            type="text"
            placeholder="Search questions and answers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search FAQs"
            className="w-full h-12 px-3 bg-transparent text-sm md:text-base text-[#14213D] placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category filter */}
        <aside className="lg:col-span-3">
          <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-[#A9812F] mb-4 px-1">
            Categories
          </h2>
          <nav className="flex flex-col gap-1" aria-label="FAQ categories">
            <button
              type="button"
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
              className={cn(
                'flex items-center justify-between px-4 py-2.5 rounded-sm text-sm text-left transition-colors',
                category === 'all'
                  ? 'bg-[#14213D] text-[#F8F7F2]'
                  : 'text-slate-600 hover:bg-[#14213D]/5'
              )}
            >
              <span>All questions</span>
              <span className="font-mono text-xs opacity-70">{faqs.length}</span>
            </button>

            {FAQ_CATEGORIES.map((cat) => {
              const count = faqs.filter((f) => f.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  aria-pressed={category === cat.id}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 rounded-sm text-sm text-left transition-colors',
                    category === cat.id
                      ? 'bg-[#14213D] text-[#F8F7F2]'
                      : 'text-slate-600 hover:bg-[#14213D]/5'
                  )}
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Results */}
        <div className="lg:col-span-9">
          <p className="font-mono text-xs text-slate-500 mb-4 px-1">
            {visibleCount} {visibleCount === 1 ? 'result' : 'results'}
          </p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.id} hidden={!visibility.get(faq.id)}>
                <FaqItem faq={faq} index={index + 1} />
              </div>
            ))}
          </div>

          {visibleCount === 0 && (
            <div className="text-center py-16 border border-dashed border-[#14213D]/15 rounded-sm">
              <MessageSquare className="w-8 h-8 text-[#14213D]/20 mx-auto mb-4" aria-hidden />
              <h3 className="font-display text-lg font-semibold text-[#14213D] mb-1">
                No matching questions
              </h3>
              <p className="text-sm text-slate-500 mb-5">Try a different search term.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                }}
                className="text-sm font-medium text-[#A9812F] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
