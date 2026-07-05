import { prisma } from "@legabit/db";

type LogAdminActionParams = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  request: Request;
};

export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  const { actorUserId, action, entityType, entityId, metadata, request } = params;
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId,
        action,
        entityType,
        entityId,
        metadata: metadata as object | undefined,
        ipAddress: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null,
        userAgent: request.headers.get("user-agent") ?? null
      }
    });
  } catch (e) {
    console.error("[audit] logAdminAction", e);
  }
}
