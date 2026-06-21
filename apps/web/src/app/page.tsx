import Link from "next/link";

import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";
import { blogPosts } from "@/lib/blog-data";
import { courses } from "@/lib/cursos-data";
import { events2026 } from "@/lib/eventos-data";
import { podcastEpisodes } from "@/lib/podcast-data";

const ecosystem = [
  {
    title: "Podcast",
    description: "Episodios y conversaciones publicadas en YouTube y Spotify.",
    href: "/podcast"
  },
  {
    title: "Newsletters",
    description: "Registro con nombre, correo y teléfono para recibir información de interés.",
    href: "/newsletter"
  },
  {
    title: "Artículos",
    description: "Análisis escritos por administradores y colaboradores de la comunidad.",
    href: "/blog"
  },
  {
    title: "Cursos",
    description: "Talleres y cursos virtuales o presenciales dictados por tutores.",
    href: "/cursos"
  },
  {
    title: "Eventos",
    description: "Calendario anual con eventos próximos y ya realizados.",
    href: "/eventos"
  }
] as const;

export default function HomePage() {
  const nextEvents = events2026.filter((event) => event.status === "Próximo").slice(0, 2);

  return (
    <div className="min-h-screen">
      <MarketingHeader />

      <main>
        <MarketingHero />

        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" id="ecosistema">
          <SectionTitle
            eyebrow="Ecosistema"
            title="Cinco espacios conectados"
            lead="Legabit organiza conocimiento y comunidad alrededor de formatos claros para aprender, publicar, escuchar y encontrarse."
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {ecosystem.map((item) => (
              <li key={item.title}>
                <Link href={item.href} className="group block h-full">
                  <article className="flex h-full flex-col rounded-xl border border-border bg-background p-5 shadow-sm transition-all group-hover:border-legabit-gold/50 group-hover:shadow-md">
                    <h3 className="font-semibold group-hover:text-legabit-petrol">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <span className="mt-5 text-xs font-semibold text-legabit-gold">Explorar</span>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-muted/25 py-16 sm:py-20" id="podcast">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle
                eyebrow="Audio y video"
                title="Podcast"
                lead="Episodios pensados para convertir temas complejos en conversaciones útiles."
              />
              <Link
                href="/podcast"
                className="mb-10 text-sm font-semibold text-legabit-charcoal underline-offset-4 hover:text-legabit-petrol hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-3">
              {podcastEpisodes.map((episode) => (
                <li key={episode.id}>
                  <article className="flex h-full flex-col rounded-xl border border-border bg-background p-6 shadow-sm">
                    <MarketingBadge>{episode.topic}</MarketingBadge>
                    <h3 className="mt-4 font-semibold leading-snug">{episode.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {episode.description}
                    </p>
                    <p className="mt-5 text-xs font-medium text-muted-foreground">
                      {episode.publishedAt} · {episode.duration}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" id="articulos">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Publicaciones"
              title="Artículos"
              lead="Análisis y guías escritas para unir rigor jurídico, lectura tecnológica y criterio financiero."
            />
            <Link
              href="/blog"
              className="mb-10 text-sm font-semibold text-legabit-charcoal underline-offset-4 hover:text-legabit-petrol hover:underline"
            >
              Ver artículos
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <article className="flex h-full flex-col rounded-xl border border-border bg-accent/15 p-6 shadow-sm transition-all group-hover:border-legabit-gold/50 group-hover:shadow-md">
                    <MarketingBadge>{post.tag}</MarketingBadge>
                    <h3 className="mt-4 font-semibold leading-snug group-hover:text-legabit-petrol">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <p className="mt-5 text-xs font-medium text-legabit-gold">Leer artículo</p>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-muted/25 py-16 sm:py-20" id="formacion-eventos">
          <div className="mx-auto grid max-w-5xl gap-12 px-6 lg:grid-cols-2">
            <div>
              <SectionTitle
                eyebrow="Formación"
                title="Cursos y talleres"
                lead="Rutas virtuales o presenciales para profesionales que quieren pasar de la lectura a la práctica."
              />
              <ul className="space-y-4">
                {courses.slice(0, 2).map((course) => (
                  <li key={course.slug}>
                    <Link href={`/cursos/${course.slug}`} className="group block">
                      <article className="rounded-xl border border-border bg-background p-5 shadow-sm transition-all group-hover:border-legabit-gold/50">
                        <div className="flex flex-wrap gap-2">
                          <MarketingBadge>{course.level}</MarketingBadge>
                          <span className="rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {course.duration}
                          </span>
                        </div>
                        <h3 className="mt-3 font-semibold group-hover:text-legabit-petrol">
                          {course.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {course.excerpt}
                        </p>
                      </article>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionTitle
                eyebrow="Agenda"
                title="Eventos"
                lead="Un calendario para seguir encuentros próximos y consultar actividades pasadas del año."
              />
              <ul className="space-y-4">
                {nextEvents.map((event) => (
                  <li key={event.id}>
                    <Link href="/eventos" className="group block">
                      <article className="rounded-xl border border-border bg-background p-5 shadow-sm transition-all group-hover:border-legabit-gold/50">
                        <div className="flex flex-wrap gap-2">
                          <MarketingBadge>{event.track}</MarketingBadge>
                          <span className="rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-semibold text-muted-foreground">
                            {event.format}
                          </span>
                        </div>
                        <h3 className="mt-3 font-semibold group-hover:text-legabit-petrol">
                          {event.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {event.date} · {event.location}
                        </p>
                      </article>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" id="newsletter">
          <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
            <div className="space-y-5">
              <MarketingBadge>Newsletter</MarketingBadge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Mantente al día con lo que realmente importa
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Déjanos tu nombre, correo y teléfono para recibir nuevas publicaciones, episodios, cursos y eventos de
                Legabit.
              </p>
              <Link
                href="/newsletter"
                className="inline-flex rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:border-legabit-petrol hover:text-legabit-petrol"
              >
                Ver página del newsletter
              </Link>
            </div>
            <NewsletterForm variant="card" source="landing" />
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
