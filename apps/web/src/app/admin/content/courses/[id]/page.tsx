"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type LessonForm = { order: number; title: string; durationMin: number; videoEmbedSrc: string; brief: string; cta: string; project: string };
type CourseForm = { slug: string; tag: string; title: string; excerpt: string; level: string; duration: string; lessons: LessonForm[] };

const EMPTY_LESSON: LessonForm = { order: 0, title: "", durationMin: 1, videoEmbedSrc: "", brief: "", cta: "", project: "" };
const EMPTY: CourseForm = { slug: "", tag: "", title: "", excerpt: "", level: "", duration: "", lessons: [] };

const INPUT = "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [form, setForm] = useState<CourseForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      if (resolvedId === "new") return;
      fetch(`/api/admin/content/courses/${resolvedId}`)
        .then((r) => r.json())
        .then((c) => {
          setForm({
            slug: c.slug, tag: c.tag, title: c.title, excerpt: c.excerpt,
            level: c.level, duration: c.duration,
            lessons: c.lessons.map((l: LessonForm & { id: string }) => ({
              order: l.order, title: l.title, durationMin: l.durationMin,
              videoEmbedSrc: l.videoEmbedSrc ?? "", brief: l.brief,
              cta: l.cta ?? "", project: l.project ?? ""
            }))
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
      lessons: id === "new" ? form.lessons.map((l) => ({ ...l, videoEmbedSrc: l.videoEmbedSrc || undefined, cta: l.cta || undefined, project: l.project || undefined })) : undefined
    };

    const url = id === "new" ? "/api/admin/content/courses" : `/api/admin/content/courses/${id}`;
    const method = id === "new" ? "POST" : "PATCH";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.message ?? "Error"); return; }
    router.push("/admin/content/courses");
  }

  function addLesson() {
    setForm((f) => ({ ...f, lessons: [...f.lessons, { ...EMPTY_LESSON, order: f.lessons.length }] }));
  }

  function updateLesson(i: number, field: keyof LessonForm, value: string | number) {
    setForm((f) => {
      const lessons = [...f.lessons];
      lessons[i] = { ...lessons[i], [field]: value };
      return { ...f, lessons };
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/content/courses" className="text-sm text-gray-500 hover:text-gray-700">← Cursos</Link>
        <h1 className="text-2xl font-bold text-gray-900">{id === "new" ? "Nuevo curso" : "Editar curso"}</h1>
      </div>

      {error && <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <Field label="Título" required><input className={INPUT} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <Field label="Slug" required><input className={INPUT} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Tag"><input className={INPUT} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} /></Field>
          <Field label="Nivel"><input className={INPUT} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Field>
          <Field label="Duración"><input className={INPUT} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
        </div>
        <Field label="Extracto"><textarea className={`${INPUT} h-20 resize-none`} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>

        {id === "new" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Lecciones ({form.lessons.length})</span>
              <button type="button" onClick={addLesson} className="text-xs text-blue-600 hover:underline">+ Añadir lección</button>
            </div>
            {form.lessons.map((lesson, i) => (
              <div key={i} className="rounded-md border border-gray-100 bg-gray-50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Lección {i + 1}</span>
                </div>
                <Field label="Título"><input className={INPUT} value={lesson.title} onChange={(e) => updateLesson(i, "title", e.target.value)} required /></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Duración (min)"><input type="number" min={1} className={INPUT} value={lesson.durationMin} onChange={(e) => updateLesson(i, "durationMin", Number(e.target.value))} /></Field>
                  <Field label="Video URL"><input className={INPUT} value={lesson.videoEmbedSrc} onChange={(e) => updateLesson(i, "videoEmbedSrc", e.target.value)} /></Field>
                </div>
                <Field label="Brief"><textarea className={`${INPUT} h-16 resize-none`} value={lesson.brief} onChange={(e) => updateLesson(i, "brief", e.target.value)} /></Field>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60 transition-colors">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
