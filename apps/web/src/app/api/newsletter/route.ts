import { newsletterSubscribeInputSchema } from "@legabit/api";
import { Prisma, prisma } from "@legabit/db";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function jsonError(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
}

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function hasSupabaseServiceCredentials(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim();
  return Boolean(url && key);
}

async function subscribeViaSupabase(
  email: string,
  displayName: string | undefined,
  source: string
): Promise<{ duplicate: boolean; missingTable: boolean; other: boolean }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("NewsletterSubscriber").insert({
    id: crypto.randomUUID(),
    email,
    displayName: displayName ?? null,
    source
  });

  if (!error) {
    return { duplicate: false, missingTable: false, other: false };
  }

  if (error.code === "23505") {
    return { duplicate: true, missingTable: false, other: false };
  }

  const msg = typeof error.message === "string" ? error.message.toLowerCase() : "";
  const missingTable =
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table");

  if (missingTable) {
    return { duplicate: false, missingTable: true, other: false };
  }

  console.error("[api/newsletter] supabase", error);
  return { duplicate: false, missingTable: false, other: true };
}

export async function POST(request: Request) {
  if (!hasDatabaseUrl() && !hasSupabaseServiceCredentials()) {
    return jsonError(503, {
      code: "MISSING_DATA_STORE",
      message:
        "Configura DATABASE_URL (Prisma) o Supabase con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY)."
    });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonError(422, {
      code: "VALIDATION_ERROR",
      message: "Cuerpo JSON inválido."
    });
  }

  const parsed = newsletterSubscribeInputSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(422, {
      code: "VALIDATION_ERROR",
      message: "Datos no válidos.",
      details: { fieldErrors: parsed.error.flatten().fieldErrors }
    });
  }

  const { email, displayName, source } = parsed.data;

  try {
    // Preferir Supabase si hay clave de servicio: evita Prisma con DATABASE_URL rota o vacía.
    if (hasSupabaseServiceCredentials()) {
      const supResult = await subscribeViaSupabase(email, displayName, source);
      if (supResult.duplicate) {
        return Response.json({
          ok: true as const,
          alreadySubscribed: true as const,
          message: "Este correo ya está suscrito."
        });
      }
      if (supResult.missingTable) {
        return jsonError(503, {
          code: "TABLE_MISSING",
          message:
            "Falta la tabla en Supabase. Abre packages/db/supabase-sql-editor/newsletter_subscriber.sql, cópialo en SQL Editor de tu proyecto Supabase y ejecútalo una vez."
        });
      }
      if (supResult.other) {
        return jsonError(503, {
          code: "INTERNAL",
          message: "No pudimos registrar la suscripción. Revisa los logs del servidor."
        });
      }
    } else if (hasDatabaseUrl()) {
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          displayName,
          source
        }
      });
    }

    return Response.json({
      ok: true as const,
      alreadySubscribed: false as const,
      message: "Suscripción registrada correctamente."
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return Response.json({
        ok: true as const,
        alreadySubscribed: true as const,
        message: "Este correo ya está suscrito."
      });
    }

    if (e instanceof Error && e.message.includes("SUPABASE_")) {
      console.error("[api/newsletter]", e);
      return jsonError(503, {
        code: "CONFIG",
        message: e.message
      });
    }

    console.error("[api/newsletter]", e);
    return jsonError(503, {
      code: "INTERNAL",
      message:
        "No pudimos registrar la suscripción (base de datos no disponible o error interno). Si usas Prisma, revisa DATABASE_URL y migraciones."
    });
  }
}
