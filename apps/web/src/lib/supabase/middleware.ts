import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

// Proxy de sesión: refresca el token de Auth en cada request y reescribe las
// cookies tanto en la request (para Server Components) como en la response
// (para el navegador). Sigue el patrón oficial de @supabase/ssr para Next.js.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, publishableKey } = getSupabasePublicEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      }
    }
  });

  // IMPORTANTE: usar getClaims() (valida la firma del JWT) para refrescar la
  // sesión. No usar getSession() en código de servidor: no garantiza revalidar.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
