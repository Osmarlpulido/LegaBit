import { AppError } from "@legabit/api";

import { type AdminUser, getAdminUser } from "./get-admin-user";

export async function requireSuperAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    const session = await import("./current-user").then((m) => m.getCurrentUser());
    if (!session) {
      throw new AppError("UNAUTHORIZED", "Debes iniciar sesión.");
    }
    throw new AppError("FORBIDDEN", "Acceso restringido a administradores de la plataforma.");
  }
  return adminUser;
}
