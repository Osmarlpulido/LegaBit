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

    const logs = await prisma.auditLog.findMany({
      take,
      cursor: cursor ? { id: cursor } : undefined,
      where: search
        ? {
            OR: [
              { action: { contains: search, mode: "insensitive" } },
              { entityType: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { email: true, displayName: true } } }
    });

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return Response.json({ items, nextCursor });
  } catch (e) {
    return errorResponse(e);
  }
}
