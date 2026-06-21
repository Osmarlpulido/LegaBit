import Link from "next/link";

import { LegabitLogo } from "@/components/marketing/legabit-logo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-legabit-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="rounded-sm outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-legabit-petrol/35 focus-visible:ring-offset-2"
        >
          <LegabitLogo />
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
          <Link href="/podcast" className="text-muted-foreground hover:text-legabit-petrol">
            Podcast
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-legabit-petrol">
            Artículos
          </Link>
          <Link href="/cursos" className="text-muted-foreground hover:text-legabit-petrol">
            Cursos
          </Link>
          <Link href="/eventos" className="text-muted-foreground hover:text-legabit-petrol">
            Eventos
          </Link>
          <Link
            href="/newsletter"
            className="rounded-lg bg-legabit-charcoal px-3 py-1.5 text-legabit-ivory hover:bg-legabit-petrol"
          >
            Newsletter
          </Link>
        </nav>
      </div>
    </header>
  );
}
