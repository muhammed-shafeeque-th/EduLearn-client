interface NumberedSectionProps {
  index: number;
  title: string;
  id?: string;
  children: React.ReactNode;
}

/**
 * Server component. Renders the "01 —" brass numbering + serif heading used
 * throughout Terms, Privacy, About, and Support so long-form text reads like
 * a formal handbook/prospectus instead of a generic marketing page.
 */
export function NumberedSection({ index, title, id, children }: NumberedSectionProps) {
  const label = String(index).padStart(2, '0');

  return (
    <section id={id} className="scroll-mt-24 py-8 border-b border-[#14213D]/10 last:border-b-0">
      <div className="flex gap-5">
        <span className="font-mono text-sm text-[#A9812F] pt-1 shrink-0 w-8">{label}</span>
        <div className="min-w-0">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-[#14213D] mb-3">
            {title}
          </h2>
          <div className="prose-formal text-slate-600 leading-relaxed space-y-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
