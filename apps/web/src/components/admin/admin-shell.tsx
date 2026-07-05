import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

type AdminShellProps = {
  children: React.ReactNode;
  email: string;
  breadcrumb: string;
};

export function AdminShell({ children, email, breadcrumb }: AdminShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader email={email} breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
