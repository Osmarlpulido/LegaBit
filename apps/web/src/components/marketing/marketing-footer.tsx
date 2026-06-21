import { LegabitLogo } from "@/components/marketing/legabit-logo";
import { SocialLinks } from "@/components/marketing/social-links";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-legabit-ivory py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <LegabitLogo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Información y comunidad sobre derecho, tecnología y finanzas.
          </p>
        </div>
        <SocialLinks />
      </div>
    </footer>
  );
}
