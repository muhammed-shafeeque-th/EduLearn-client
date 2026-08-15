interface NumberedSectionProps {
  index: number;
  title: string;
  id?: string;
  children: React.ReactNode;
}

export function NumberedSection({ index, title, id, children }: NumberedSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 py-8 border-b last:border-b-0">
      <div className="flex gap-5">
        <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
          {index}
        </span>
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{title}</h2>
          <div className="text-muted-foreground leading-relaxed space-y-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
