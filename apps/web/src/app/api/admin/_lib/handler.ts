import { AppError } from "@legabit/api";

import { type AdminUser } from "@/lib/auth/get-admin-user";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

type AdminHandler = (req: Request, admin: AdminUser) => Promise<Response>;

export function withAdminAuth(handler: AdminHandler) {
  return async (req: Request): Promise<Response> => {
    try {
      const admin = await requireSuperAdmin();
      return await handler(req, admin);
    } catch (e) {
      if (e instanceof AppError) {
        return Response.json({ code: e.code, message: e.message }, { status: e.status });
      }
      console.error("[admin-handler]", e);
      return Response.json({ code: "INTERNAL", message: "Error interno del servidor." }, { status: 500 });
    }
  };
}

export function errorResponse(e: unknown): Response {
  if (e instanceof AppError) {
    return Response.json({ code: e.code, message: e.message }, { status: e.status });
  }
  console.error("[admin-handler] errorResponse", e);
  return Response.json({ code: "INTERNAL", message: "Error interno del servidor." }, { status: 500 });
}
