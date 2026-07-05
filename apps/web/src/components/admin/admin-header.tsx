import Link from "next/link";

type AdminHeaderProps = {
  email: string;
  breadcrumb: string;
};

export function AdminHeader({ email, breadcrumb }: AdminHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <p className="text-sm font-medium text-gray-600">{breadcrumb}</p>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{email}</span>
        <Link
          href="/auth/signout"
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cerrar sesión
        </Link>
      </div>
    </header>
  );
}
