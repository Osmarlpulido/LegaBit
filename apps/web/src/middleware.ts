import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return response;
  }

  // Verificar sesión para rutas /admin (Prisma no corre en Edge, solo chequeamos JWT aquí).
  // La verificación de platformRole ocurre en el layout del admin via getAdminUser().
  const { url, publishableKey } = getSupabasePublicEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {}
    }
  });

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("admin_required", "1");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};
