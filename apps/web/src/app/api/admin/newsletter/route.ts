import { adminListQuerySchema } from "@legabit/api";
import { prisma } from "@legabit/db";

import { errorResponse } from "../_lib/handler";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const query = adminListQuerySchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined
    });

    const { cursor, limit, search } = query;
    const take = limit + 1;

    const subscribers = await prisma.newsletterSubscriber.findMany({
      take,
      cursor: cursor ? { id: cursor } : undefined,
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { displayName: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined,
      orderBy: { createdAt: "desc" }
    });

    const hasMore = subscribers.length > limit;
    const items = hasMore ? subscribers.slice(0, limit) : subscribers;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return Response.json({ items, nextCursor });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ code: "VALIDATION_ERROR", message: "Se requiere el parámetro id." }, { status: 422 });
    }

    await prisma.newsletterSubscriber.delete({ where: { id } });

    await import("@/lib/admin/audit").then((m) =>
      m.logAdminAction({
        actorUserId: admin.prismaUser.id,
        action: "newsletter.delete",
        entityType: "NewsletterSubscriber",
        entityId: id,
        request: req
      })
    );

    return new Response(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
