import { Breadcrumbs, BreadcrumbItem } from './breadcrumbs';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumb: BreadcrumbItem[];
  children?: React.ReactNode;
}

/**
 * Shared hero for FAQ/About/Contact/Support pages. Uses the same visual
 * language as the app's actual theme: soft gradient background, pill-shaped
 * eyebrow badge (bg-primary/10 + text-primary — identical pattern to the
 * original "Support Center" badge), bold sans headline, no invented colors.
 */
export function PageHero({ eyebrow, title, description, breadcrumb, children }: PageHeroProps) {
  return (
    <header className="relative overflow-hidden border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-14 md:pt-14 md:pb-20">
        <Breadcrumbs items={breadcrumb} />

        <span className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {eyebrow}
        </span>

        <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
          {title}
        </h1>

        {description && (
          <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {children}
      </div>
    </header>
  );
}
