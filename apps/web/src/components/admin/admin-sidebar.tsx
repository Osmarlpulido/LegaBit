"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Resumen", href: "/admin/overview" },
  { label: "Usuarios", href: "/admin/users" },
  { label: "Organizaciones", href: "/admin/organizations" },
  { label: "Newsletter", href: "/admin/newsletter" },
  { label: "Audit Logs", href: "/admin/audit-logs" },
] as const;

const CONTENT_ITEMS = [
  { label: "Blog", href: "/admin/content/blog" },
  { label: "Cursos", href: "/admin/content/courses" },
  { label: "Podcast", href: "/admin/content/podcast" },
  { label: "Eventos", href: "/admin/content/events" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50 px-4 py-6">
      <div className="mb-8">
        <span className="text-lg font-bold tracking-tight text-gray-900">Legabit</span>
        <span className="ml-2 rounded bg-gray-900 px-1.5 py-0.5 text-xs font-semibold text-white">Admin</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, href }) => (
          <NavLink key={href} href={href} label={label} active={pathname === href || pathname.startsWith(href + "/")} />
        ))}

        <div className="pt-4">
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Contenido</p>
          {CONTENT_ITEMS.map(({ label, href }) => (
            <NavLink key={href} href={href} label={label} active={pathname === href || pathname.startsWith(href + "/")} />
          ))}
        </div>
      </nav>
    </aside>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-gray-900 text-white"
          : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}
