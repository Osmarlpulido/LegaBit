"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BlogPostForm = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  content: string;
  readingTime: string;
  author: string;
  publishedAt: string;
};

const EMPTY: BlogPostForm = {
  slug: "", tag: "", title: "", excerpt: "", content: "", readingTime: "", author: "Equipo Legabit", publishedAt: ""
};

export default function BlogPostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [form, setForm] = useState<BlogPostForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      if (resolvedId === "new") return;
      fetch(`/api/admin/content/blog/${resolvedId}`)
        .then((r) => r.json())
        .then((post) => {
          setForm({
            slug: post.slug,
            tag: post.tag,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            readingTime: post.readingTime ?? "",
            author: post.author,
            publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : ""
          });
        });
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      ...form,
      readingTime: form.readingTime || undefined,
      publishedAt: form.publishedAt || undefined
    };

    const url = id === "new" ? "/api/admin/content/blog" : `/api/admin/content/blog/${id}`;
    const method = id === "new" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Error al guardar");
      return;
    }
    router.push("/admin/content/blog");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/content/blog" className="text-sm text-gray-500 hover:text-gray-700">← Blog</Link>
        <h1 className="text-2xl font-bold text-gray-900">{id === "new" ? "Nuevo post" : "Editar post"}</h1>
      </div>

      {error && <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <Field label="Título" required><input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <Field label="Slug (kebab-case)" required><input className={INPUT} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tag"><input className={INPUT} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} /></Field>
          <Field label="Autor"><input className={INPUT} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Field>
        </div>
        <Field label="Extracto"><textarea className={`${INPUT} h-20 resize-none`} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>
        <Field label="Contenido (Markdown)" required><textarea className={`${INPUT} h-64 resize-y font-mono text-xs`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tiempo de lectura"><input className={INPUT} placeholder="5 min" value={form.readingTime} onChange={(e) => setForm({ ...form, readingTime: e.target.value })} /></Field>
          <Field label="Fecha publicación"><input type="date" className={INPUT} value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} /></Field>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

const INPUT = "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
