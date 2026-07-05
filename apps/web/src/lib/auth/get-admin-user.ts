import { type User } from "@legabit/db";
import { prisma } from "@legabit/db";

import { getCurrentUser } from "./current-user";

export type AdminUser = {
  supabaseId: string;
  email: string;
  prismaUser: User;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const session = await getCurrentUser();
    if (!session) return null;

    const prismaUser = await prisma.user.findUnique({
      where: { supabaseUserId: session.id }
    });
    if (!prismaUser || prismaUser.platformRole !== "super_admin") return null;

    return {
      supabaseId: session.id,
      email: session.email ?? prismaUser.email,
      prismaUser
    };
  } catch {
    return null;
  }
}
