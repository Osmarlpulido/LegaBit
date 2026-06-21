import type { Metadata } from "next";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";

export const metadata: Metadata = {
  title: "Newsletter — Legabit",
  description:
    "Suscríbete al newsletter de Legabit para recibir información seleccionada sobre derecho, tecnología y finanzas."
};

const topics = [
  "Regulación y cumplimiento",
  "Tecnología aplicada al derecho",
  "Finanzas, fintech y criptoactivos",
  "Cursos, talleres y eventos"
];

export default function NewsletterPage() {
  return (
    <MarketingShell>
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[1fr_420px] lg:items-start">
        <div>
          <SectionTitle
            eyebrow="Newsletter"
            title="Recibe análisis útil sin ruido"
            lead="Comparte tus datos de contacto y te enviaremos contenidos, cursos y eventos alineados con el ecosistema de derecho, tecnología y finanzas."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => (
              <div key={topic} className="rounded-xl border border-border bg-background p-4">
                <MarketingBadge>Interés</MarketingBadge>
                <p className="mt-3 text-sm font-medium">{topic}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            La lista se usará para enviar ediciones editoriales, avisos de nuevos episodios,
            convocatorias a talleres y actualizaciones de eventos. No vendemos tus datos y puedes
            darte de baja cuando quieras.
          </p>
        </div>

        <NewsletterForm variant="card" source="newsletter-page" />
      </div>
    </MarketingShell>
  );
}
