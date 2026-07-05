"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EpisodeForm = { slug: string; title: string; description: string; topic: string; duration: string; youtubeUrl: string; spotifyUrl: string; publishedAt: string };
const EMPTY: EpisodeForm = { slug: "", title: "", description: "", topic: "", duration: "", youtubeUrl: "", spotifyUrl: "", publishedAt: "" };
const INPUT = "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

export default function PodcastEpisodeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [form, setForm] = useState<EpisodeForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      if (resolvedId === "new") return;
      fetch(`/api/admin/content/podcast/${resolvedId}`).then((r) => r.json()).then((ep) => {
        setForm({ slug: ep.slug, title: ep.title, description: ep.description, topic: ep.topic, duration: ep.duration, youtubeUrl: ep.youtubeUrl ?? "", spotifyUrl: ep.spotifyUrl ?? "", publishedAt: ep.publishedAt ? ep.publishedAt.slice(0, 10) : "" });
      });
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const body = { ...form, youtubeUrl: form.youtubeUrl || undefined, spotifyUrl: form.spotifyUrl || undefined, publishedAt: form.publishedAt || undefined };
    const url = id === "new" ? "/api/admin/content/podcast" : `/api/admin/content/podcast/${id}`;
    const res = await fetch(url, { method: id === "new" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.message ?? "Error"); return; }
    router.push("/admin/content/podcast");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/content/podcast" className="text-sm text-gray-500 hover:text-gray-700">← Podcast</Link>
        <h1 className="text-2xl font-bold text-gray-900">{id === "new" ? "Nuevo episodio" : "Editar episodio"}</h1>
      </div>
      {error && <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <F l="Título" required><input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></F>
        <F l="Slug" required><input className={INPUT} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></F>
        <div className="grid grid-cols-2 gap-4">
          <F l="Tema"><input className={INPUT} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></F>
          <F l="Duración"><input className={INPUT} placeholder="45 min" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></F>
        </div>
        <F l="Descripción"><textarea className={`${INPUT} h-24 resize-none`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></F>
        <div className="grid grid-cols-2 gap-4">
          <F l="YouTube URL"><input className={INPUT} type="url" value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} /></F>
          <F l="Spotify URL"><input className={INPUT} type="url" value={form.spotifyUrl} onChange={(e) => setForm({ ...form, spotifyUrl: e.target.value })} /></F>
        </div>
        <F l="Fecha publicación"><input type="date" className={INPUT} value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} /></F>
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
