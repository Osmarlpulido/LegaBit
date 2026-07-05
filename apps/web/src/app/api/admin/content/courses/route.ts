import { adminCreateCourseSchema, adminListQuerySchema } from "@legabit/api";
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

    const courses = await prisma.course.findMany({
      take,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        deletedAt: null,
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {})
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { lessons: true } } }
    });

    const hasMore = courses.length > limit;
    const items = hasMore ? courses.slice(0, limit) : courses;
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
    const { lessons, ...courseData } = adminCreateCourseSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        ...courseData,
        lessons: { create: lessons }
      },
      include: { lessons: { orderBy: { order: "asc" } } }
    });

    await logAdminAction({
      actorUserId: admin.prismaUser.id,
      action: "course.create",
      entityType: "Course",
      entityId: course.id,
      metadata: { title: course.title },
      request: req
    });

    return Response.json(course, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
