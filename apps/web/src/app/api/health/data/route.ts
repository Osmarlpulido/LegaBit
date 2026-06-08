import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Diagnóstico sin secretos: qué backend usa el newsletter y si PostgREST responde.
 * En desarrollo incluye una lectura mínima a `NewsletterSubscriber`.
 */
export async function GET() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? null;
  const hasPublishable = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim());
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim()
  );
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

  let newsletterUses: "supabase" | "prisma" | "none" = "none";
  if (projectUrl && hasServiceKey) newsletterUses = "supabase";
  else if (hasDatabaseUrl) newsletterUses = "prisma";

  const payload: Record<string, unknown> = {
    explanation:
      "El newsletter usa la API REST de Supabase (PostgREST) si hay URL del proyecto y clave de servicio. Prisma es conexión directa PostgreSQL y solo se usa si hay DATABASE_URL y no hay ruta Supabase preferida en el código del newsletter.",
    supabase: {
      projectUrl,
      publishableKeyConfigured: hasPublishable,
      serviceKeyConfigured: hasServiceKey
    },
    prisma: {
      databaseUrlConfigured: hasDatabaseUrl
    },
    newsletterRegistrationUses: newsletterUses
  };

  if (process.env.NODE_ENV === "development" && projectUrl && hasServiceKey) {
    try {
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase
        .from("NewsletterSubscriber")
        .select("id", { count: "exact", head: true });

      payload.supabaseLive = error
        ? { restReadable: false, code: error.code ?? null, message: error.message }
        : { restReadable: true, message: "PostgREST puede leer la tabla NewsletterSubscriber." };
    } catch (e) {
      payload.supabaseLive = {
        restReadable: false,
        message: e instanceof Error ? e.message : "Error desconocido"
      };
    }
  }

  return Response.json(payload);
}
