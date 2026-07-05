import Link from "next/link";
import { notFound } from "next/navigation";

type Member = {
  id: string;
  role: string;
  user: { id: string; email: string; displayName: string | null; imageUrl: string | null };
};

type OrgDetail = {
  id: string;
  name: string;
  slug: string;
  type: string;
  createdAt: string;
  memberships: Member[];
};

async function getOrg(id: string): Promise<OrgDetail | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/admin/organizations/${id}`, {
    cache: "no-store"
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al cargar organización");
  return res.json();
}

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrg(id);
  if (!org) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations" className="text-sm text-gray-500 hover:text-gray-700">← Organizaciones</Link>
        <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-3">
        <div className="flex gap-4"><span className="w-32 text-sm font-medium text-gray-500">Slug</span><span className="font-mono text-xs text-gray-800">{org.slug}</span></div>
        <div className="flex gap-4"><span className="w-32 text-sm font-medium text-gray-500">Tipo</span><span className="text-sm text-gray-800">{org.type}</span></div>
        <div className="flex gap-4"><span className="w-32 text-sm font-medium text-gray-500">Creado</span><span className="text-sm text-gray-800">{new Date(org.createdAt).toLocaleString("es-CO")}</span></div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Miembros ({org.memberships.length})</h2>
        {org.memberships.length === 0 ? (
          <p className="text-sm text-gray-400">Sin miembros.</p>
        ) : (
          <div className="space-y-2">
            {org.memberships.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 text-sm">
                <span className="text-gray-800">{m.user.displayName ?? m.user.email}</span>
                <span className="text-gray-500">{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
