"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EventForm = {
  slug: string; title: string; description: string; eventDate: string; eventTime: string;
  format: string; location: string; track: string; status: string;
};
const EMPTY: EventForm = { slug: "", title: "", description: "", eventDate: "", eventTime: "", format: "VIRTUAL", location: "", track: "DERECHO", status: "UPCOMING" };
const INPUT = "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

export default function EventEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [form, setForm] = useState<EventForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      if (resolvedId === "new") return;
      fetch(`/api/admin/content/events/${resolvedId}`).then((r) => r.json()).then((ev) => {
        setForm({ slug: ev.slug, title: ev.title, description: ev.description, eventDate: ev.eventDate.slice(0, 10), eventTime: ev.eventTime, format: ev.format, location: ev.location, track: ev.track, status: ev.status });
      });
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = id === "new" ? "/api/admin/content/events" : `/api/admin/content/events/${id}`;
    const res = await fetch(url, { method: id === "new" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.message ?? "Error"); return; }
    router.push("/admin/content/events");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/content/events" className="text-sm text-gray-500 hover:text-gray-700">← Eventos</Link>
        <h1 className="text-2xl font-bold text-gray-900">{id === "new" ? "Nuevo evento" : "Editar evento"}</h1>
      </div>
      {error && <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <F l="Título" required><input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></F>
        <F l="Slug" required><input className={INPUT} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></F>
        <F l="Descripción"><textarea className={`${INPUT} h-24 resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></F>
        <div className="grid grid-cols-2 gap-4">
          <F l="Fecha"><input type="date" className={INPUT} value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required /></F>
          <F l="Hora"><input className={INPUT} placeholder="6:00 PM" value={form.eventTime} onChange={(e) => setForm({ ...form, eventTime: e.target.value })} /></F>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <F l="Formato">
            <select className={INPUT} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
              <option value="VIRTUAL">Virtual</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="HIBRIDO">Híbrido</option>
            </select>
          </F>
          <F l="Track">
            <select className={INPUT} value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}>
              <option value="DERECHO">Derecho</option>
              <option value="TECNOLOGIA">Tecnología</option>
              <option value="FINANZAS">Finanzas</option>
              <option value="COMUNIDAD">Comunidad</option>
            </select>
          </F>
          <F l="Estado">
            <select className={INPUT} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="UPCOMING">Próximo</option>
              <option value="PAST">Pasado</option>
            </select>
          </F>
        </div>
        <F l="Ubicación"><input className={INPUT} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></F>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60 transition-colors">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function F({ l, children, required }: { l: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{l}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
