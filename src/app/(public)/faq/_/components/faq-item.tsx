import { FAQ } from '../data';

/**
 * Native <details>/<summary> — fully crawlable, zero client JS needed to
 * expand/collapse. Restyled with theme tokens (bg-card, border, text-primary)
 * instead of hardcoded navy/brass hex so it matches the rest of the app.
 */
export function FaqItem({ faq, index }: { faq: FAQ; index: number }) {
  return (
    <details
      className="group border rounded-xl bg-card open:border-primary/40 open:shadow-sm transition-colors"
      data-faq-id={faq.id}
      data-faq-category={faq.category}
    >
      <summary className="list-none cursor-pointer select-none px-5 py-4 flex items-start gap-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="text-xs font-bold text-primary pt-1 shrink-0 w-6">
          {String(index).padStart(2, '0')}
        </span>
        <span className="text-base md:text-lg text-foreground font-semibold flex-1">
          {faq.question}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 12 8"
          className="w-3 h-3 mt-2 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:text-primary"
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
      <div className="px-5 pb-5 pl-[3.75rem] -mt-1 border-t pt-4">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
      </div>
    </details>
  );
}
