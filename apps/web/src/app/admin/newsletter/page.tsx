"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { DataTable, type ColumnDef } from "@/components/admin/data-table";

type Subscriber = {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  source: string;
  createdAt: string;
};

const COLUMNS: ColumnDef<Subscriber>[] = [
  { key: "email", header: "Email", render: (r) => r.email },
  { key: "name", header: "Nombre", render: (r) => r.displayName ?? "—" },
  { key: "phone", header: "Teléfono", render: (r) => r.phone ?? "—" },
  { key: "source", header: "Fuente", render: (r) => r.source },
  { key: "created", header: "Fecha", render: (r) => new Date(r.createdAt).toLocaleDateString("es-CO") }
];

export default function NewsletterPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (search) params.set("search", search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-newsletter", cursor, search],
    queryFn: () => fetch(`/api/admin/newsletter?${params}`).then((r) => r.json())
  });

  function exportCsv() {
    const items: Subscriber[] = data?.items ?? [];
    const header = "email,nombre,telefono,fuente,fecha";
    const rows = items.map((s) =>
      [s.email, s.displayName ?? "", s.phone ?? "", s.source, s.createdAt].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
        <button
          onClick={exportCsv}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Exportar CSV
        </button>
      </div>
      <DataTable<Subscriber>
        columns={COLUMNS}
        data={data?.items ?? []}
        nextCursor={data?.nextCursor ?? null}
        onNextPage={() => { if (!data?.nextCursor) return; setCursorHistory((h) => [...h, cursor ?? ""]); setCursor(data.nextCursor); }}
        onPrevPage={() => { const prev = cursorHistory[cursorHistory.length - 1] ?? null; setCursorHistory((h) => h.slice(0, -1)); setCursor(prev); }}
        hasPrev={cursorHistory.length > 0}
        isLoading={isLoading}
        searchPlaceholder="Buscar por email o nombre..."
        onSearch={(v) => { setSearch(v); setCursor(null); setCursorHistory([]); }}
        actions={(row) => (
          <button
            onClick={async () => {
              if (!confirm(`¿Eliminar suscriptor ${row.email}?`)) return;
              await fetch(`/api/admin/newsletter?id=${row.id}`, { method: "DELETE" });
              qc.invalidateQueries({ queryKey: ["admin-newsletter"] });
            }}
            className="text-xs text-red-600 hover:underline"
          >
            Eliminar
          </button>
        )}
      />
    </div>
  );
}
