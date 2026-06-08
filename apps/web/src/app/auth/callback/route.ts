import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Registra el correo verificado por Google en la lista del newsletter.
// Usa la clave de servidor (omite RLS) e ignora duplicados.
async function recordVerifiedEmail(email: string | undefined, displayName: string | null) {
  if (!email) return;
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("NewsletterSubscriber").insert({
      id: crypto.randomUUID(),
      email,
      displayName,
      source: "google-auth"
    });
    // 23505 = email duplicado: ya estaba suscrito, no es un error real.
    if (error && error.code !== "23505") {
      console.error("[auth/callback] recordVerifiedEmail", error);
    }
  } catch (e) {
    console.error("[auth/callback] recordVerifiedEmail", e);
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const user = data.user;
      const displayName =
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.name as string | undefined) ??
        null;
      await recordVerifiedEmail(user?.email, displayName);

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
