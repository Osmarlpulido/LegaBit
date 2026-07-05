"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DataTable, type ColumnDef } from "@/components/admin/data-table";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actor: { email: string; displayName: string | null } | null;
};

const COLUMNS: ColumnDef<AuditLog>[] = [
  { key: "action", header: "Acción", render: (r) => <span className="font-mono text-xs">{r.action}</span> },
  { key: "entity", header: "Entidad", render: (r) => `${r.entityType}${r.entityId ? ` (${r.entityId.slice(0, 8)}…)` : ""}` },
  { key: "actor", header: "Actor", render: (r) => r.actor?.email ?? "—" },
  { key: "date", header: "Fecha", render: (r) => new Date(r.createdAt).toLocaleString("es-CO") }
];

export default function AuditLogsPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (search) params.set("search", search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", cursor, search],
    queryFn: () => fetch(`/api/admin/audit-logs?${params}`).then((r) => r.json())
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      <DataTable<AuditLog>
        columns={COLUMNS}
        data={data?.items ?? []}
        nextCursor={data?.nextCursor ?? null}
        onNextPage={() => { if (!data?.nextCursor) return; setCursorHistory((h) => [...h, cursor ?? ""]); setCursor(data.nextCursor); }}
        onPrevPage={() => { const prev = cursorHistory[cursorHistory.length - 1] ?? null; setCursorHistory((h) => h.slice(0, -1)); setCursor(prev); }}
        hasPrev={cursorHistory.length > 0}
        isLoading={isLoading}
        searchPlaceholder="Buscar por acción o entidad..."
        onSearch={(v) => { setSearch(v); setCursor(null); setCursorHistory([]); }}
      />
    </div>
  );
}
