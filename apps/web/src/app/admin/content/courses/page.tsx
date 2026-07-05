"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { DataTable, type ColumnDef } from "@/components/admin/data-table";

type Course = {
  id: string;
  slug: string;
  tag: string;
  title: string;
  level: string;
  createdAt: string;
  _count: { lessons: number };
};

const COLUMNS: ColumnDef<Course>[] = [
  { key: "title", header: "Título", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "tag", header: "Tag", render: (r) => r.tag },
  { key: "level", header: "Nivel", render: (r) => r.level },
  { key: "lessons", header: "Lecciones", render: (r) => r._count.lessons },
  { key: "date", header: "Creado", render: (r) => new Date(r.createdAt).toLocaleDateString("es-CO") }
];

export default function CoursesAdminPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (search) params.set("search", search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses", cursor, search],
    queryFn: () => fetch(`/api/admin/content/courses?${params}`).then((r) => r.json())
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
        <Link href="/admin/content/courses/new" className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
          Nuevo curso
        </Link>
      </div>
      <DataTable<Course>
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
            <Link href={`/admin/content/courses/${row.id}`} className="text-xs text-blue-600 hover:underline">Editar</Link>
            <button
              onClick={async () => {
                if (!confirm(`¿Eliminar "${row.title}"?`)) return;
                await fetch(`/api/admin/content/courses/${row.id}`, { method: "DELETE" });
                qc.invalidateQueries({ queryKey: ["admin-courses"] });
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        )}
      />
    </div>
  );
}
