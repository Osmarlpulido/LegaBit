import type { Metadata } from "next";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";
import { events2026 } from "@/lib/eventos-data";

export const metadata: Metadata = {
  title: "Eventos — Legabit",
  description:
    "Calendario de eventos próximos y pasados de Legabit sobre derecho, tecnología y finanzas."
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00-05:00`));
}

export default function EventosPage() {
  const upcoming = events2026.filter((event) => event.status === "Próximo");
  const past = events2026.filter((event) => event.status === "Pasado");

  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <SectionTitle
          eyebrow="Calendario 2026"
          title="Eventos"
          lead="Agenda anual con encuentros virtuales, presenciales e híbridos para aprender, debatir y conectar alrededor del ecosistema Legabit."
        />

        <section aria-labelledby="eventos-proximos">
          <h2 id="eventos-proximos" className="text-xl font-semibold tracking-tight">
            Próximos eventos
          </h2>
          <ul className="mt-5 grid gap-4">
            {upcoming.map((event) => (
              <li key={event.id}>
                <article className="grid gap-5 rounded-2xl border border-border bg-background p-6 shadow-sm md:grid-cols-[180px_1fr]">
                  <div className="rounded-xl bg-legabit-petrol px-4 py-5 text-legabit-ivory">
                    <p className="text-sm font-semibold">{formatDate(event.date)}</p>
                    <p className="mt-2 text-xs text-legabit-ivory/75">{event.time}</p>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <MarketingBadge>{event.track}</MarketingBadge>
                      <MarketingBadge>{event.format}</MarketingBadge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">{event.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                    <p className="mt-4 text-sm font-medium text-legabit-charcoal">
                      {event.location}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border-t border-border pt-12" aria-labelledby="eventos-pasados">
          <h2 id="eventos-pasados" className="text-xl font-semibold tracking-tight">
            Eventos pasados
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {past.map((event) => (
              <li key={event.id}>
                <article className="h-full rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="flex flex-wrap gap-2">
                    <MarketingBadge>{event.track}</MarketingBadge>
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {event.status}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold leading-snug">{event.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {formatDate(event.date)} · {event.location}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </MarketingShell>
  );
}
