import { adminPatchEventSchema, AppError } from "@legabit/api";
import { prisma } from "@legabit/db";

import { errorResponse } from "../../../../_lib/handler";
import { logAdminAction } from "@/lib/admin/audit";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const event = await prisma.legabitEvent.findFirst({ where: { id, deletedAt: null } });
    if (!event) throw new AppError("NOT_FOUND", "Evento no encontrado.");

    return Response.json(event);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const data = adminPatchEventSchema.parse(body);

    const event = await prisma.legabitEvent.update({ where: { id }, data });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "event.patch",
      entityType: "LegabitEvent",
      entityId: id,
      request: req
    });

    return Response.json(event);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    await prisma.legabitEvent.update({ where: { id }, data: { deletedAt: new Date() } });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "event.delete",
      entityType: "LegabitEvent",
      entityId: id,
      request: req
    });

    return new Response(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
