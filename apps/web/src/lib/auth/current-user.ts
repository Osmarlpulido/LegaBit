import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
};

// Lee el usuario actual desde las cookies de sesión validando el JWT con getClaims().
// Devuelve null si no hay sesión válida. Seguro para usar en Server Components.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
      return null;
    }

    const claims = data.claims as { sub?: string; email?: string };
    if (!claims.sub) {
      return null;
    }

    return {
      id: claims.sub,
      email: claims.email ?? null
    };
  } catch {
    return null;
  }
}
