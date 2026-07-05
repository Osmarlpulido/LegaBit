"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { DataTable, type ColumnDef } from "@/components/admin/data-table";

type LegabitEvent = {
  id: string;
  slug: string;
  title: string;
  format: string;
  track: string;
  status: string;
  eventDate: string;
};

const COLUMNS: ColumnDef<LegabitEvent>[] = [
  { key: "title", header: "Título", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "format", header: "Formato", render: (r) => r.format },
  { key: "track", header: "Track", render: (r) => r.track },
  {
    key: "status",
    header: "Estado",
    render: (r) => r.status === "UPCOMING"
      ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Próximo</span>
      : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Pasado</span>
  },
  { key: "date", header: "Fecha", render: (r) => new Date(r.eventDate).toLocaleDateString("es-CO") }
];

export default function EventsAdminPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (search) params.set("search", search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-events", cursor, search],
    queryFn: () => fetch(`/api/admin/content/events?${params}`).then((r) => r.json())
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <Link href="/admin/content/events/new" className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
          Nuevo evento
        </Link>
      </div>
      <DataTable<LegabitEvent>
        columns={COLUMNS}
        data={data?.items ?? []}
        nextCursor={data?.nextCursor ?? null}
        onNextPage={() => { if (!data?.nextCursor) return; setCursorHistory((h) => [...h, cursor ?? ""]); setCursor(data.nextCursor); }}
        onPrevPage={() => { const prev = cursorHistory[cursorHistory.length - 1] ?? null; setCursorHistory((h) => h.slice(0, -1)); setCursor(prev); }}
        hasPrev={cursorHistory.length > 0}
        isLoading={isLoading}
        searchPlaceholder="Buscar por título..."
        onSearch={(v) => { setSearch(v); setCursor(null); setCursorHistory([]); }}
        actions={(row) => (
          <div className="flex gap-3 justify-end">
            <Link href={`/admin/content/events/${row.id}`} className="text-xs text-blue-600 hover:underline">Editar</Link>
            <button onClick={async () => { if (!confirm(`¿Eliminar "${row.title}"?`)) return; await fetch(`/api/admin/content/events/${row.id}`, { method: "DELETE" }); qc.invalidateQueries({ queryKey: ["admin-events"] }); }} className="text-xs text-red-600 hover:underline">Eliminar</button>
          </div>
        )}
      />
    </div>
  );
}
