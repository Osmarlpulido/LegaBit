"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { DataTable, type ColumnDef } from "@/components/admin/data-table";

type User = {
  id: string;
  email: string;
  displayName: string | null;
  platformRole: string;
  createdAt: string;
  _count: { memberships: number };
};

const COLUMNS: ColumnDef<User>[] = [
  { key: "email", header: "Email", render: (r) => r.email },
  { key: "name", header: "Nombre", render: (r) => r.displayName ?? "—" },
  {
    key: "role",
    header: "Rol",
    render: (r) =>
      r.platformRole === "super_admin" ? (
        <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">super_admin</span>
      ) : (
        <span className="text-gray-500">—</span>
      )
  },
  { key: "orgs", header: "Orgs", render: (r) => r._count.memberships },
  { key: "created", header: "Registro", render: (r) => new Date(r.createdAt).toLocaleDateString("es-CO") }
];

export default function UsersPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (search) params.set("search", search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", cursor, search],
    queryFn: () => fetch(`/api/admin/users?${params}`).then((r) => r.json())
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

  function handleSearch(value: string) {
    setSearch(value);
    setCursor(null);
    setCursorHistory([]);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
      <DataTable<User>
        columns={COLUMNS}
        data={data?.items ?? []}
        nextCursor={data?.nextCursor ?? null}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        hasPrev={cursorHistory.length > 0}
        isLoading={isLoading}
        searchPlaceholder="Buscar por email o nombre..."
        onSearch={handleSearch}
        actions={(row) => (
          <Link href={`/admin/users/${row.id}`} className="text-xs text-blue-600 hover:underline">
            Ver
          </Link>
        )}
      />
    </div>
  );
}
