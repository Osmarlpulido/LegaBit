"use client";

import { useState } from "react";

export type ColumnDef<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  nextCursor: string | null;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasPrev: boolean;
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  actions?: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  data,
  nextCursor,
  onNextPage,
  onPrevPage,
  hasPrev,
  isLoading,
  searchPlaceholder,
  onSearch,
  actions
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  function handleSearch(value: string) {
    setSearch(value);
    onSearch?.(value);
  }

  return (
    <div className="space-y-4">
      {onSearch && (
        <input
          type="text"
          placeholder={searchPlaceholder ?? "Buscar..."}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-400">
                  Sin resultados
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-gray-700 ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">{actions(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onPrevPage}
          disabled={!hasPrev || isLoading}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={onNextPage}
          disabled={!nextCursor || isLoading}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
