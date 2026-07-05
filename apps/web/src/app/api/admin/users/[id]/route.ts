import { adminPatchUserSchema, AppError } from "@legabit/api";
import { prisma } from "@legabit/db";

import { errorResponse } from "../../_lib/handler";
import { logAdminAction } from "@/lib/admin/audit";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { memberships: { include: { organization: true } } }
    });
    if (!user) throw new AppError("NOT_FOUND", "Usuario no encontrado.");

    return Response.json(user);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const data = adminPatchUserSchema.parse(body);

    // Evitar que el super_admin se quite el rol a sí mismo
    if (id === admin.prismaUser.id && data.platformRole === "none") {
      throw new AppError("FORBIDDEN", "No puedes quitarte el rol de super_admin a ti mismo.");
    }

    const user = await prisma.user.update({ where: { id }, data });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "user.patch",
      entityType: "User",
      entityId: id,
      metadata: data,
      request: req
    });

    return Response.json(user);
  } catch (e) {
    return errorResponse(e);
  }
}
