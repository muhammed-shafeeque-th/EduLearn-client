import { BreadCrumbItem, Breadcrumbs } from './breadcrumbs';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumb: BreadCrumbItem[];
  children?: React.ReactNode;
}

/**
 * Server component. The signature "handbook" motif: a brass rule + mono
 * eyebrow above a serif display headline, on paper. Used identically on
 * public pages reads as one coherent, formal section of the site.
 */
export function PageHero({ eyebrow, title, description, breadcrumb, children }: PageHeroProps) {
  return (
    <header className="border-b border-[#14213D]/10 bg-[#F8F7F2]">
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-14 md:pt-14 md:pb-20">
        <Breadcrumbs items={breadcrumb} />

        <div className="mt-8 flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-[#A9812F]" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#A9812F]">
            {eyebrow}
          </span>
        </div>

        <h1 className="font-display mt-4 text-4xl md:text-5xl font-semibold text-[#14213D] leading-[1.1]">
          {title}
        </h1>

        {description && (
          <p className="mt-5 max-w-2xl text-base md:text-lg text-slate-600 leading-relaxed">
            {description}
          </p>
        )}

        {children}
      </div>
    </header>
  );
}
