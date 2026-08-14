import { FAQ } from '../data';

/**
 * Native <details>/<summary> instead of a framer-motion driven accordion:
 * - Content is in the DOM and readable by crawlers whether open or closed.
 * - Expand/collapse works with zero client JS (progressive enhancement).
 * - The chevron rotation and border are pure CSS, so there's no hydration
 *   cost and no layout shift while React attaches.
 */
export function FaqItem({ faq, index }: { faq: FAQ; index: number }) {
  return (
    <details
      className="group border border-[#14213D]/10 rounded-sm bg-white open:border-[#A9812F]/40 open:shadow-sm transition-colors"
      data-faq-id={faq.id}
      data-faq-category={faq.category}
    >
      <summary className="list-none cursor-pointer select-none px-5 py-4 flex items-start gap-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-xs text-[#A9812F] pt-1 shrink-0 w-6">
          {String(index).padStart(2, '0')}
        </span>
        <span className="font-display text-base md:text-lg text-[#14213D] font-medium flex-1">
          {faq.question}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 12 8"
          className="w-3 h-3 mt-2 shrink-0 text-[#14213D]/40 transition-transform duration-200 group-open:rotate-180 group-open:text-[#A9812F]"
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
      </summary>
      <div className="px-5 pb-5 pl-[3.75rem] -mt-1 border-t border-[#14213D]/5 pt-4">
        <p className="text-sm md:text-base text-slate-600 leading-relaxed">{faq.answer}</p>
      </div>
    </details>
  );
}
