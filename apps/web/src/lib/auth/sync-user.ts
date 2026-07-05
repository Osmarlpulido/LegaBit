import { prisma } from "@legabit/db";

type SyncUserParams = {
  supabaseUserId: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
};

export async function syncUserFromSupabase(params: SyncUserParams) {
  const { supabaseUserId, email, displayName, imageUrl } = params;
  try {
    await prisma.user.upsert({
      where: { supabaseUserId },
      create: { supabaseUserId, email, displayName, imageUrl, platformRole: "none" },
      update: { email, displayName, imageUrl }
    });
  } catch (e) {
    console.error("[sync-user] syncUserFromSupabase", e);
  }
}
