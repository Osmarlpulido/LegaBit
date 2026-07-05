import { adminCreateOrganizationSchema, adminListQuerySchema } from "@legabit/api";
import { prisma } from "@legabit/db";

import { errorResponse } from "../_lib/handler";
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

    const orgs = await prisma.organization.findMany({
      take,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        deletedAt: null,
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { memberships: true } } }
    });

    const hasMore = orgs.length > limit;
    const items = hasMore ? orgs.slice(0, limit) : orgs;
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
    const data = adminCreateOrganizationSchema.parse(body);

    const org = await prisma.organization.create({ data });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "organization.create",
      entityType: "Organization",
      entityId: org.id,
      metadata: { name: org.name },
      request: req
    });

    return Response.json(org, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
