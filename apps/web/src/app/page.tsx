import Link from "next/link";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";
import { SocialLinks } from "@/components/marketing/social-links";

const blogPreview = [
  {
    tag: "Análisis",
    title: "Criptoactivos y derecho penal: mapa de riesgos para la asesoría",
    excerpt: "Marco práctico para priorizar líneas defensivas y preguntas clave ante clientes institucionales."
  },
  {
    tag: "Tendencias",
    title: "Trazabilidad on-chain sin perder rigor jurídico",
    excerpt: "Cómo comunicar evidencia digital sin caer en sobrecarga técnica ante jueces y equipos externos."
  },
  {
    tag: "Estrategia",
    title: "Web3 y nuevas líneas de ingreso para despachos",
    excerpt: "Productos de conocimiento, compliance y educación: qué encaja según tu escala y nicho."
  }
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />

      <main>
        <MarketingHero />

        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" id="como-funciona">
          <SectionTitle
            title="No te falta voluntad. Te falta un mapa claro."
            lead="Tres fricciones habituales que resolvemos con contenido curado y lenguaje jurídico."
          />
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                t: "Clientes más exigentes",
                d: "Ya preguntan por criptoactivos, trazabilidad, tokenización o riesgos penales digitales."
              },
              {
                t: "Poco tiempo real",
                d: "Entre audiencias y gestión diaria, estudiar tecnología desde cero no es una opción realista."
              },
              {
                t: "Demasiado ruido",
                d: "Faltan fuentes que traduzcan blockchain al lenguaje que necesitas para decidir con seguridad."
              }
            ].map((card) => (
              <article key={card.t} className="rounded-2xl border border-border bg-accent/20 p-6">
                <h3 className="text-lg font-semibold">{card.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="border-y border-border bg-muted/30 py-16 sm:py-20"
          id="preview-blog"
          aria-labelledby="preview-blog-heading"
        >
          <div className="mx-auto max-w-5xl px-6">
            <SectionTitle
              eyebrow="Vista previa"
              title="Blog"
              lead="Artículos y análisis en preparación. Pronto publicación en el sitio."
            />
            <p className="-mt-4 mb-10">
              <Link href="/blog" className="text-sm font-semibold text-legabit-charcoal underline-offset-4 hover:underline hover:text-legabit-petrol">
                Ver página del blog
              </Link>
            </p>
            <ul className="grid gap-6 sm:grid-cols-3">
              {blogPreview.map((post, i) => (
                <li key={i}>
                  <article className="flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {post.tag}
                    </span>
                    <h3 id={i === 0 ? "preview-blog-heading" : undefined} className="mt-2 font-semibold leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    <p className="mt-4 text-xs font-medium text-muted-foreground">Próximamente · legabit.blog</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" id="cursos">
          <SectionTitle
            eyebrow="Próximamente"
            title="Cursos y talleres"
            lead="Plantillas prácticas, talleres guiados y rutas cortas pensadas para equipos jurídicos y profesionales independientes."
          />
          <p className="-mt-4 mb-10">
            <Link href="/cursos" className="text-sm font-semibold text-legabit-charcoal underline-offset-4 hover:underline hover:text-legabit-petrol">
              Ver LMS piloto y tablero colaborativo
            </Link>
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <article className="rounded-2xl border border-dashed border-border bg-accent/15 p-8">
              <h3 className="text-xl font-semibold">Taller intensivo blockchain & penal</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sesiones síncronas, casos reales sintéticos y checklists aplicables desde la primera semana.
              </p>
              <p className="mt-6 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Inscripciones · por anunciar
              </p>
            </article>
            <article className="rounded-2xl border border-dashed border-border bg-accent/15 p-8">
              <h3 className="text-xl font-semibold">Ruta autoguiada: compliance Web3</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Módulos cortos, evaluaciones y material descargable para escalar tu asesoría sin perder rigor.
              </p>
              <p className="mt-6 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                Lista de espera · activa con el newsletter
              </p>
            </article>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20 py-16 sm:py-20" id="recursos">
          <div className="mx-auto max-w-5xl px-6">
            <SectionTitle
              eyebrow="Próximamente"
              title="Recursos"
              lead="Biblioteca de guías, glosario jurídico–técnico y plantillas que acompañan tu práctica diaria."
            />
            <p className="-mt-4 mb-10">
              <Link href="/recursos" className="text-sm font-semibold text-legabit-charcoal underline-offset-4 hover:underline hover:text-legabit-petrol">
                Ver biblioteca de recursos
              </Link>
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {["Glosario jurídico Web3", "Checklist de debida diligencia", "Plantillas de comunicación a cliente"].map(
                (name) => (
                  <div
                    key={name}
                    className="rounded-xl border border-border bg-background/80 px-4 py-5 text-sm font-medium text-muted-foreground"
                  >
                    {name}
                    <span className="mt-2 block text-xs font-normal text-muted-foreground/80">
                      Disponible con el lanzamiento público del hub.
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24 pt-8" id="newsletter">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <MarketingBadge>Newsletter</MarketingBadge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Empieza en dos pasos</h2>
              <ol className="list-inside list-decimal space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Suscríbete al newsletter:</span> análisis claro,
                  accionable y sin sobrecarga.
                </li>
                <li>
                  <span className="font-medium text-foreground">Únete a la comunidad:</span> desde el envío te
                  compartimos enlaces de acceso.
                </li>
              </ol>
              <p className="text-sm text-muted-foreground">
                Sin spam. Sin tecnicismos innecesarios. Los enlaces a Discord, Telegram y YouTube tienen URL por
                defecto; puedes sobrescribirlos con{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_LEGABIT_DISCORD_URL</code>,{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_LEGABIT_TELEGRAM_URL</code> y{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_LEGABIT_YOUTUBE_URL</code>.
              </p>
              <SocialLinks />
            </div>
            <NewsletterForm variant="card" source="landing" />
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
