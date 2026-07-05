import { StatsCard } from "@/components/admin/stats-card";

type StatsData = {
  users: { total: number; last7d: number };
  organizations: { total: number };
  newsletter: { total: number; last7d: number };
  content: {
    blogPosts: number;
    courses: number;
    podcastEpisodes: number;
    events: number;
  };
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    actor: { email: string; displayName: string | null } | null;
  }>;
};

async function getStats(): Promise<StatsData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "http://localhost:3000"}/api/admin/stats`, {
    cache: "no-store",
    headers: { cookie: "" }
  });
  if (!res.ok) throw new Error("Error al cargar estadísticas");
  return res.json();
}

export default async function OverviewPage() {
  let stats: StatsData | null = null;
  let error: string | null = null;

  try {
    stats = await getStats();
  } catch {
    error = "No se pudieron cargar las estadísticas. Verifica la conexión a la base de datos.";
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Resumen</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Usuarios" value={stats.users.total} trend={{ value: stats.users.last7d, label: "esta semana" }} />
        <StatsCard title="Organizaciones" value={stats.organizations.total} />
        <StatsCard title="Newsletter" value={stats.newsletter.total} trend={{ value: stats.newsletter.last7d, label: "esta semana" }} />
        <StatsCard title="Posts publicados" value={stats.content.blogPosts} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Cursos" value={stats.content.courses} />
        <StatsCard title="Episodios Podcast" value={stats.content.podcastEpisodes} />
        <StatsCard title="Eventos" value={stats.content.events} />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Actividad reciente</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acción</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Entidad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">Sin actividad registrada</td>
                </tr>
              ) : (
                stats.recentAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{log.action}</td>
                    <td className="px-4 py-3 text-gray-600">{log.entityType}</td>
                    <td className="px-4 py-3 text-gray-600">{log.actor?.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString("es-CO")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
