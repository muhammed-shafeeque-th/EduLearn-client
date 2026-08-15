'use client';

import { useMemo, useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { FAQ, FAQ_CATEGORIES, FaqCategoryId } from '../data';
import { FaqItem } from './faq-item';
import { cn } from '@/lib/utils';

/**
 * Only client component in the FAQ page. Filtering hides non-matching items
 * with `hidden` instead of removing them from the tree, so search engines
 * still see every question in the server-rendered HTML.
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
        <div className="relative flex items-center bg-card border rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="ml-4 text-muted-foreground w-4 h-4 shrink-0" aria-hidden />
          <input
            type="text"
            placeholder="Search questions and answers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search FAQs"
            className="w-full h-12 px-3 bg-transparent text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category filter */}
        <aside className="lg:col-span-3">
          <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-4 px-1">
            Categories
          </h2>
          <nav className="flex flex-col gap-1" aria-label="FAQ categories">
            <button
              type="button"
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
              className={cn(
                'flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-colors',
                category === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <span>All questions</span>
              <span className="text-xs opacity-70">{faqs.length}</span>
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
                    'flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-colors',
                    category === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Results */}
        <div className="lg:col-span-9">
          <p className="text-xs text-muted-foreground mb-4 px-1">
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
            <div className="text-center py-16 border-2 border-dashed rounded-2xl">
              <MessageSquare
                className="w-8 h-8 text-muted-foreground/40 mx-auto mb-4"
                aria-hidden
              />
              <h3 className="text-lg font-semibold text-foreground mb-1">No matching questions</h3>
              <p className="text-sm text-muted-foreground mb-5">Try a different search term.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                }}
                className="text-sm font-medium text-primary hover:underline"
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
