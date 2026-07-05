import { prisma } from "@legabit/db";

import { errorResponse } from "../_lib/handler";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    await requireSuperAdmin();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalOrgs,
      totalNewsletterSubs,
      totalBlogPosts,
      totalCourses,
      totalPodcastEpisodes,
      totalEvents,
      newUsersLast7d,
      newSubsLast7d,
      recentAuditLogs
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.newsletterSubscriber.count(),
      prisma.blogPost.count({ where: { deletedAt: null } }),
      prisma.course.count({ where: { deletedAt: null } }),
      prisma.podcastEpisode.count({ where: { deletedAt: null } }),
      prisma.legabitEvent.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null } }),
      prisma.newsletterSubscriber.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { email: true, displayName: true } } }
      })
    ]);

    return Response.json({
      users: { total: totalUsers, last7d: newUsersLast7d },
      organizations: { total: totalOrgs },
      newsletter: { total: totalNewsletterSubs, last7d: newSubsLast7d },
      content: {
        blogPosts: totalBlogPosts,
        courses: totalCourses,
        podcastEpisodes: totalPodcastEpisodes,
        events: totalEvents
      },
      recentAuditLogs
    });
  } catch (e) {
    return errorResponse(e);
  }
}
