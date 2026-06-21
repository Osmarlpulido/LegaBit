-- ============================================================================
-- Tabla NewsletterSubscriber para Supabase (ejecutar UNA vez en SQL Editor).
-- Idempotente: puedes ejecutarlo varias veces sin error.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "phone" TEXT,
    "source" TEXT NOT NULL DEFAULT 'landing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "phone" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber" ("email");

CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_createdAt_idx" ON "NewsletterSubscriber" ("createdAt");

-- ----------------------------------------------------------------------------
-- Seguridad (RLS): la tabla está en el esquema `public`, expuesto por la Data API.
-- Activamos RLS y NO creamos políticas para los roles `anon` / `authenticated`,
-- de modo que la clave publishable del navegador NO pueda leer ni escribir correos.
-- La inserción del newsletter pasa por /api/newsletter con la clave de servidor
-- (`sb_secret_…`), que omite RLS. Así los correos quedan privados.
-- ----------------------------------------------------------------------------
ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NewsletterSubscriber" FORCE ROW LEVEL SECURITY;

-- Revocar cualquier acceso directo de los roles expuestos (defensa en profundidad).
REVOKE ALL ON TABLE "NewsletterSubscriber" FROM anon, authenticated;
