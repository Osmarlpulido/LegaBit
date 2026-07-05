import Link from "next/link";
import { notFound } from "next/navigation";

type Membership = {
  id: string;
  role: string;
  organization: { id: string; name: string; slug: string };
};

type UserDetail = {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
  platformRole: string;
  createdAt: string;
  memberships: Membership[];
};

async function getUser(id: string): Promise<UserDetail | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/admin/users/${id}`, {
    cache: "no-store"
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al cargar usuario");
  return res.json();
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-sm text-gray-500 hover:text-gray-700">← Usuarios</Link>
        <h1 className="text-2xl font-bold text-gray-900">{user.displayName ?? user.email}</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-3">
        <Row label="ID" value={user.id} mono />
        <Row label="Email" value={user.email} />
        <Row label="Nombre" value={user.displayName ?? "—"} />
        <Row label="Rol plataforma" value={user.platformRole} />
        <Row label="Registro" value={new Date(user.createdAt).toLocaleString("es-CO")} />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Organizaciones ({user.memberships.length})</h2>
        {user.memberships.length === 0 ? (
          <p className="text-sm text-gray-400">Sin membresías.</p>
        ) : (
          <div className="space-y-2">
            {user.memberships.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 text-sm">
                <span className="font-medium text-gray-800">{m.organization.name}</span>
                <span className="text-gray-500">{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-32 flex-shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <span className={`text-sm text-gray-800 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
