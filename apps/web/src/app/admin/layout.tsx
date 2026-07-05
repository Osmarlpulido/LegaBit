import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminUser } from "@/lib/auth/get-admin-user";

export const metadata = { title: "Admin — Legabit" };

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) notFound();

  return (
    <AdminShell email={admin.email} breadcrumb="Panel de Administración">
      {children}
    </AdminShell>
  );
}
