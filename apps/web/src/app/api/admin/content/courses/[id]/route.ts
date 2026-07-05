import { adminPatchCourseSchema, AppError } from "@legabit/api";
import { prisma } from "@legabit/db";

import { errorResponse } from "../../../../_lib/handler";
import { logAdminAction } from "@/lib/admin/audit";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const course = await prisma.course.findFirst({
      where: { id, deletedAt: null },
      include: { lessons: { orderBy: { order: "asc" } } }
    });
    if (!course) throw new AppError("NOT_FOUND", "Curso no encontrado.");

    return Response.json(course);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const data = adminPatchCourseSchema.parse(body);

    const course = await prisma.course.update({ where: { id }, data });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "course.patch",
      entityType: "Course",
      entityId: id,
      request: req
    });

    return Response.json(course);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    await prisma.course.update({ where: { id }, data: { deletedAt: new Date() } });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "course.delete",
      entityType: "Course",
      entityId: id,
      request: req
    });

    return new Response(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
