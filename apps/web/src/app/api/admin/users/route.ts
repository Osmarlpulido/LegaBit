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

    const users = await prisma.user.findMany({
      take,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { displayName: { contains: search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { memberships: true } } }
    });

    const hasMore = users.length > limit;
    const items = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return Response.json({ items, nextCursor });
  } catch (e) {
    return errorResponse(e);
  }
}
