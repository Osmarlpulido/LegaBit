import { adminCreateEventSchema, adminListQuerySchema } from "@legabit/api";
import { prisma } from "@legabit/db";

import { errorResponse } from "../../../_lib/handler";
import { logAdminAction } from "@/lib/admin/audit";
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

    const events = await prisma.legabitEvent.findMany({
      take,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        deletedAt: null,
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {})
      },
      orderBy: { eventDate: "desc" }
    });

    const hasMore = events.length > limit;
    const items = hasMore ? events.slice(0, limit) : events;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return Response.json({ items, nextCursor });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const admin = await requireSuperAdmin();
    const body = await req.json();
    const data = adminCreateEventSchema.parse(body);

    const event = await prisma.legabitEvent.create({ data });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "event.create",
      entityType: "LegabitEvent",
      entityId: event.id,
      metadata: { title: event.title },
      request: req
    });

    return Response.json(event, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
