"use client";

import { useMemo, useState } from "react";

export type CourseLesson = {
  id: string;
  title: string;
  durationMin: number;
  /** URL para iframe embed (YouTube, Vimeo, etc.). Si falta, mostramos marcador de posición. */
  videoEmbedSrc?: string | null;
  brief: string;
  cta?: string;
  project?: string;
};

export function CourseLmsView({ lessons }: { lessons: CourseLesson[] }) {
  const firstId = lessons[0]?.id ?? "";
  const [activeId, setActiveId] = useState(firstId);

  const lesson = useMemo(() => lessons.find((l) => l.id === activeId) ?? lessons[0], [lessons, activeId]);

  if (!lesson) {
    return null;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start">
      <nav aria-label="Lecciones del curso" className="rounded-2xl border border-border bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contenido</p>
        <ol className="mt-3 space-y-1">
          {lessons.map((l, index) => {
            const selected = l.id === lesson.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(l.id)}
                  className={`flex w-full flex-col rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? "bg-background font-medium shadow-sm ring-1 ring-legabit-gold/40"
                      : "hover:bg-muted/60 hover:text-legabit-petrol"
                  }`}
                >
                  <span className="text-xs text-muted-foreground">
                    Lección {index + 1} · {l.durationMin} min
                  </span>
                  <span className="mt-0.5 leading-snug">{l.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <article className="min-w-0 space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lección actual
          </p>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{lesson.title}</h2>
        </header>

        <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-sm">
          <div className="aspect-video w-full bg-muted">
            {lesson.videoEmbedSrc ? (
              <iframe
                title={`Video: ${lesson.title}`}
                src={lesson.videoEmbedSrc}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
                <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                  Vídeo de la lección
                </span>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Aquí se reproducirá el vídeo cuando publiquemos el módulo. Mientras tanto, usa la descripción y el
                  proyecto sugerido.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-background p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resumen</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{lesson.brief}</p>

          {lesson.project ? (
            <div className="rounded-xl border border-dashed border-border bg-accent/20 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proyecto colaborativo</p>
              <p className="mt-1 text-sm leading-relaxed">{lesson.project}</p>
            </div>
          ) : null}

          {lesson.cta ? (
            <p className="text-sm font-medium text-foreground">{lesson.cta}</p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
