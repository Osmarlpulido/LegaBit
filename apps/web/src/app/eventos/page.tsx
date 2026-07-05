import type { Metadata } from "next";

import { prisma } from "@legabit/db";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Eventos — Legabit",
  description: "Calendario de eventos próximos y pasados de Legabit sobre derecho, tecnología y finanzas."
};

const TRACK_LABEL: Record<string, string> = {
  DERECHO: "Derecho", TECNOLOGIA: "Tecnología", FINANZAS: "Finanzas", COMUNIDAD: "Comunidad"
};
const FORMAT_LABEL: Record<string, string> = {
  VIRTUAL: "Virtual", PRESENCIAL: "Presencial", HIBRIDO: "Híbrido"
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "long", year: "numeric" });

export default async function EventosPage() {
  const events = await prisma.legabitEvent.findMany({
    where: { deletedAt: null },
    orderBy: { eventDate: "asc" }
  });

  const upcoming = events.filter((e) => e.status === "UPCOMING");
  const past = events.filter((e) => e.status === "PAST");

  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <SectionTitle
          eyebrow="Calendario 2026"
          title="Eventos"
          lead="Agenda anual con encuentros virtuales, presenciales e híbridos para aprender, debatir y conectar alrededor del ecosistema Legabit."
        />

        <section aria-labelledby="eventos-proximos">
          <h2 id="eventos-proximos" className="text-xl font-semibold tracking-tight">Próximos eventos</h2>
          <ul className="mt-5 grid gap-4">
            {upcoming.map((event) => (
              <li key={event.id}>
                <article className="grid gap-5 rounded-2xl border border-border bg-background p-6 shadow-sm md:grid-cols-[180px_1fr]">
                  <div className="rounded-xl bg-legabit-petrol px-4 py-5 text-legabit-ivory">
                    <p className="text-sm font-semibold">{dateFormatter.format(event.eventDate)}</p>
                    <p className="mt-2 text-xs text-legabit-ivory/75">{event.eventTime}</p>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <MarketingBadge>{TRACK_LABEL[event.track] ?? event.track}</MarketingBadge>
                      <MarketingBadge>{FORMAT_LABEL[event.format] ?? event.format}</MarketingBadge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">{event.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                    <p className="mt-4 text-sm font-medium text-legabit-charcoal">{event.location}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border-t border-border pt-12" aria-labelledby="eventos-pasados">
          <h2 id="eventos-pasados" className="text-xl font-semibold tracking-tight">Eventos pasados</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {past.map((event) => (
              <li key={event.id}>
                <article className="h-full rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="flex flex-wrap gap-2">
                    <MarketingBadge>{TRACK_LABEL[event.track] ?? event.track}</MarketingBadge>
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Pasado
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold leading-snug">{event.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {dateFormatter.format(event.eventDate)} · {event.location}
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
