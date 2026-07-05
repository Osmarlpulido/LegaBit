import { adminPatchBlogPostSchema, AppError } from "@legabit/api";
import { prisma } from "@legabit/db";

import { errorResponse } from "../../../../_lib/handler";
import { logAdminAction } from "@/lib/admin/audit";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const post = await prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
    if (!post) throw new AppError("NOT_FOUND", "Post no encontrado.");

    return Response.json(post);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    const body = await req.json();
    const data = adminPatchBlogPostSchema.parse(body);

    const post = await prisma.blogPost.update({ where: { id }, data });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "blogPost.patch",
      entityType: "BlogPost",
      entityId: id,
      request: req
    });

    return Response.json(post);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    await prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "blogPost.delete",
      entityType: "BlogPost",
      entityId: id,
      request: req
    });

    return new Response(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
