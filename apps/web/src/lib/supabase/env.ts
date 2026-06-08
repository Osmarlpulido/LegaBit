// Leer env dentro de las funciones para que `.env.local` se aplique en runtime (no al compilar).
export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      "Faltan variables de Supabase. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return { url, publishableKey };
}

export function getSupabaseServiceEnv() {
  const { url } = getSupabasePublicEnv();
  // Preferimos SUPABASE_SECRET_KEY (formato `sb_secret_…`), que es el reemplazo
  // moderno del antiguo `service_role` JWT. SUPABASE_SERVICE_ROLE_KEY queda como
  // override opcional para compatibilidad con proyectos que aún usan la clave legacy.
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceKey) {
    throw new Error(
      "Falta la clave de servidor de Supabase. Define SUPABASE_SECRET_KEY (recomendado, `sb_secret_…`) o, alternativamente, SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return {
    url,
    serviceRoleKey: serviceKey
  };
}