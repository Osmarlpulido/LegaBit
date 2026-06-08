export function MarketingBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-legabit-gold/35 bg-legabit-gold/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-legabit-charcoal/85">
      {children}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <div className="mb-10 max-w-2xl space-y-3">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {lead ? <p className="text-base leading-relaxed text-muted-foreground">{lead}</p> : null}
    </div>
  );
}
