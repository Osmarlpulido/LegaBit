"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-lg rounded-2xl border border-border bg-background p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Error global
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            La aplicación encontró un error al renderizar.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Esto suele pasar cuando una ruta o un layout lanza una excepción. Reintenta la carga y
            revisa la consola para ver el detalle exacto.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-lg bg-legabit-charcoal px-4 py-2 text-sm font-semibold text-legabit-ivory hover:bg-legabit-petrol"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
