"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setLoading(true);
    setError(null);

    const result = await authClient.signOut();
    if (result.error) {
      setError("No pudimos cerrar la sesión. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    window.location.assign("/");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={loading}
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-legabit-petrol/40 hover:text-legabit-petrol disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Cerrando…" : "Cerrar sesión"}
      </button>
      {error ? <span role="status" className="text-xs font-medium text-red-700">{error}</span> : null}
    </div>
  );
}
