import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge } from "@/components/marketing/marketing-section";
import { getAllCourseSlugs, getCourseBySlug } from "@/lib/cursos-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: `${course.title} — Legabit`,
    description: course.excerpt
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) notFound();

  const totalMin = course.lessons.reduce((acc, l) => acc + l.durationMin, 0);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <nav className="mb-8">
          <Link
            href="/cursos"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-legabit-petrol transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver a Cursos
          </Link>
        </nav>

        <header className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <MarketingBadge>{course.tag}</MarketingBadge>
            <MarketingBadge>{course.level}</MarketingBadge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{course.title}</h1>
          <p className="text-base leading-relaxed text-muted-foreground">{course.excerpt}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {totalMin} min total · {course.lessons.length} lecciones
            </span>
          </div>
        </header>

        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold">Lecciones del curso</h2>

          {course.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="rounded-2xl border border-border bg-background overflow-hidden"
            >
              <div className="flex items-start gap-4 p-6">
                <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-legabit-petrol text-legabit-ivory text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold leading-tight">{lesson.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {lesson.durationMin} min
                    </span>
                    {lesson.videoEmbedSrc && (
                      <span className="rounded-full bg-legabit-gold/15 px-2 py-0.5 text-[10px] font-medium text-legabit-charcoal">
                        Vídeo disponible
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{lesson.brief}</p>
                </div>
              </div>

              {lesson.videoEmbedSrc && (
                <div className="border-t border-border px-6 pb-6">
                  <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl">
                    <iframe
                      src={lesson.videoEmbedSrc}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}

              {(lesson.cta ?? lesson.project) && (
                <div className="border-t border-border bg-muted/20 px-6 py-4">
                  {lesson.cta && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-legabit-gold">→</span>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        <strong className="font-medium text-legabit-charcoal">Práctica:</strong>{" "}
                        {lesson.cta}
                      </p>
                    </div>
                  )}
                  {lesson.project && (
                    <div className="flex items-start gap-2 mt-2">
                      <span className="mt-0.5 text-legabit-gold">★</span>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        <strong className="font-medium text-legabit-charcoal">Proyecto:</strong>{" "}
                        {lesson.project}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-legabit-gold/30 bg-legabit-gold/5 p-8 text-center">
          <h3 className="font-semibold text-legabit-charcoal">¿Quieres acceder a este curso?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Los cursos completos están disponibles para miembros de la comunidad Legabit.
            Únete al newsletter para estar entre los primeros en el lanzamiento.
          </p>
          <Link
            href="/newsletter"
            className="mt-4 inline-block rounded-lg bg-legabit-charcoal px-5 py-2.5 text-sm font-medium text-legabit-ivory hover:bg-legabit-petrol transition-colors"
          >
            Únete al newsletter
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
