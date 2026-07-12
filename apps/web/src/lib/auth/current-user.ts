import { currentUserResponseSchema } from "@legabit/api-contracts";
import { cookies } from "next/headers";

export type CurrentUser = {
  id: string;
  email: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
    const apiUrl = process.env.API_INTERNAL_URL?.trim() ?? "http://localhost:4000";
    const response = await fetch(`${apiUrl}/api/v1/me`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store"
    });
    if (!response.ok) return null;

    const parsed = currentUserResponseSchema.safeParse(await response.json());
    if (!parsed.success) return null;

    return {
      id: parsed.data.user.id,
      email: parsed.data.user.email
    };
  } catch {
    return null;
  }
}
