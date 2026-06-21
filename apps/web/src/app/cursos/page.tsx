import type { Metadata } from "next";
import Link from "next/link";

import { CourseLmsView } from "@/components/marketing/course-lms";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { MarketingBadge, SectionTitle } from "@/components/marketing/marketing-section";
import { courses } from "@/lib/cursos-data";

export const metadata: Metadata = {
  title: "Cursos y talleres — Legabit",
  description:
    "Formación tipo LMS sobre derecho, tecnología y finanzas: vídeos por lección, proyectos prácticos y tablero colaborativo."
};


type LeaderRow = {
  rank: number;
  displayName: string;
  role: string;
  projectTitle: string;
  lessonsDone: number;
  communityScore: number;
  highlight?: string;
};

const leaderboard: LeaderRow[] = [
  {
    rank: 1,
    displayName: "María G.",
    role: "Legal ops · CDMX",
    projectTitle: "Memo ejecutivo de decisión digital",
    lessonsDone: 4,
    communityScore: 184,
    highlight: "Proyecto destacado"
  },
  {
    rank: 2,
    displayName: "Diego R.",
    role: "Compliance · Bogotá",
    projectTitle: "Política interna de IA responsable",
    lessonsDone: 4,
    communityScore: 172
  },
  {
    rank: 3,
    displayName: "Laura M.",
    role: "Fintech · Madrid",
    projectTitle: "Flujo de onboarding con controles",
    lessonsDone: 3,
    communityScore: 156
  },
  {
    rank: 4,
    displayName: "Andrés V.",
    role: "Asesoría independiente · Lima",
    projectTitle: "Matriz legal-financiera de producto",
    lessonsDone: 3,
    communityScore: 141
  },
  {
    rank: 5,
    displayName: "Paula S.",
    role: "Producto financiero · Santiago",
    projectTitle: "Revisión de claims comerciales",
    lessonsDone: 2,
    communityScore: 98
  }
];

function RankMedal({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold tabular-nums ring-1 ring-border"
        title={`Puesto ${rank}`}
      >
        {rank}º
      </span>
    );
  }
  return <span className="tabular-nums text-muted-foreground">{rank}</span>;
}

export default function CursosPage() {
  const featuredCourse = courses[0]!;

  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <SectionTitle
          eyebrow="Legabit"
          title="Cursos y talleres"
          lead="Cursos virtuales y talleres presenciales para convertir información sobre derecho, tecnología y finanzas en práctica profesional."
        />

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {courses.map((course) => (
            <li key={course.slug}>
              <Link href={`/cursos/${course.slug}`} className="group block h-full">
                <article className="flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-legabit-gold/40">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <MarketingBadge>{course.tag}</MarketingBadge>
                    <MarketingBadge>{course.level}</MarketingBadge>
                  </div>
                  <h2 className="text-base font-semibold leading-snug group-hover:text-legabit-petrol transition-colors">
                    {course.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {course.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {course.lessons.length} lecciones · {course.duration}
                    </span>
                    <span className="text-xs font-medium text-legabit-gold group-hover:translate-x-0.5 transition-transform">
                      Ver curso →
                    </span>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <MarketingBadge>Ruta piloto</MarketingBadge>
          <MarketingBadge>LMS + proyectos</MarketingBadge>
        </div>

        <header className="mt-6 max-w-3xl space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{featuredCourse.title}</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Curso en formato LMS: cada lección incluye vídeo (o su marcador hasta publicación), un resumen breve y, cuando
            aplica, un proyecto para aplicar lo aprendido. Los proyectos entregados pueden recibir valoraciones de la
            comunidad para mantener un tablero vivo y colaborativo — no es una competencia cerrada, es retroalimentación
            entre pares.
          </p>
        </header>

        <div className="mt-14">
          <CourseLmsView lessons={featuredCourse.lessons} />
        </div>

        <section className="mt-20 border-t border-border pt-16" aria-labelledby="leaderboard-heading">
          <SectionTitle
            eyebrow="Comunidad"
            title="Tablero de proyectos valorados"
            lead="Quienes completan los proyectos pueden compartirlos en el espacio comunitario. El puntaje refleja valoraciones de estudiantes y tutores (demo estática hasta integrar backend)."
          />

          <div className="overflow-x-auto rounded-2xl border border-border bg-muted/15">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Miembro</th>
                  <th className="px-4 py-3 font-medium">Proyecto</th>
                  <th className="px-4 py-3 font-medium">Lecciones</th>
                  <th className="px-4 py-3 font-medium">Puntos comunidad</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.rank} className="border-b border-border last:border-0 hover:bg-muted/25">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <RankMedal rank={row.rank} />
                        {row.highlight ? (
                          <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-border">
                            {row.highlight}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="font-medium">{row.displayName}</div>
                      <div className="text-xs text-muted-foreground">{row.role}</div>
                    </td>
                    <td className="px-4 py-3 align-middle text-muted-foreground">{row.projectTitle}</td>
                    <td className="px-4 py-3 align-middle tabular-nums">{row.lessonsDone}</td>
                    <td className="px-4 py-3 align-middle tabular-nums font-medium">{row.communityScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            En producción, las valoraciones serán con guías de rubrica (claridad jurídica, uso de fuentes, aplicabilidad)
            para reducir sesgos y mantener un ambiente constructivo. Las iniciales protegen la privacidad hasta que el
            miembro opte por un perfil público.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
