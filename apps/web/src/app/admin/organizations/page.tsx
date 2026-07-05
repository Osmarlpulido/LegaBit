"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { DataTable, type ColumnDef } from "@/components/admin/data-table";

type Org = {
  id: string;
  name: string;
  slug: string;
  type: string;
  createdAt: string;
  _count: { memberships: number };
};

const COLUMNS: ColumnDef<Org>[] = [
  { key: "name", header: "Nombre", render: (r) => r.name },
  { key: "slug", header: "Slug", render: (r) => <span className="font-mono text-xs">{r.slug}</span> },
  { key: "type", header: "Tipo", render: (r) => r.type },
  { key: "members", header: "Miembros", render: (r) => r._count.memberships },
  { key: "created", header: "Creado", render: (r) => new Date(r.createdAt).toLocaleDateString("es-CO") }
];

export default function OrganizationsPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (search) params.set("search", search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orgs", cursor, search],
    queryFn: () => fetch(`/api/admin/organizations?${params}`).then((r) => r.json())
  });

  function handleNextPage() {
    if (!data?.nextCursor) return;
    setCursorHistory((h) => [...h, cursor ?? ""]);
    setCursor(data.nextCursor);
  }

  function handlePrevPage() {
    const prev = cursorHistory[cursorHistory.length - 1] ?? null;
    setCursorHistory((h) => h.slice(0, -1));
    setCursor(prev);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Organizaciones</h1>
      <DataTable<Org>
        columns={COLUMNS}
        data={data?.items ?? []}
        nextCursor={data?.nextCursor ?? null}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        hasPrev={cursorHistory.length > 0}
        isLoading={isLoading}
        searchPlaceholder="Buscar por nombre..."
        onSearch={(v) => { setSearch(v); setCursor(null); setCursorHistory([]); }}
        actions={(row) => (
          <Link href={`/admin/organizations/${row.id}`} className="text-xs text-blue-600 hover:underline">
            Ver
          </Link>
        )}
      />
    </div>
  );
}
