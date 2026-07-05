import { adminPatchOrganizationSchema, AppError } from "@legabit/api";
import { prisma } from "@legabit/db";

import { errorResponse } from "../../_lib/handler";
import { logAdminAction } from "@/lib/admin/audit";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const org = await prisma.organization.findUnique({
      where: { id },
      include: { memberships: { include: { user: { select: { id: true, email: true, displayName: true, imageUrl: true } } } } }
    });
    if (!org) throw new AppError("NOT_FOUND", "Organización no encontrada.");

    return Response.json(org);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const data = adminPatchOrganizationSchema.parse(body);

    const org = await prisma.organization.update({ where: { id }, data });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "organization.patch",
      entityType: "Organization",
      entityId: id,
      metadata: data,
      request: req
    });

    return Response.json(org);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    await prisma.organization.update({ where: { id }, data: { deletedAt: new Date() } });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "organization.delete",
      entityType: "Organization",
      entityId: id,
      request: req
    });

    return new Response(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
