"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { SocialLinks } from "@/components/marketing/social-links";

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-legabit-gold/35 bg-legabit-gold/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-legabit-charcoal/85">
      {children}
    </span>
  );
}

export function MarketingHero() {
  return (
    <section
      className="min-h-[680px] border-b border-border bg-legabit-ivory bg-cover bg-center"
      style={{ backgroundImage: "url('/legabit-ecosystem-hero.svg')" }}
    >
      <div className="mx-auto flex min-h-[680px] max-w-5xl items-center px-6 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-2xl space-y-8"
        >
          <div className="flex flex-wrap gap-2">
            <Badge>Derecho</Badge>
            <Badge>Tecnología</Badge>
            <Badge>Finanzas</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Legabit.{" "}
              <span className="font-normal text-muted-foreground">
                Un ecosistema para aprender, analizar y conectar ideas entre derecho, tecnología y finanzas.
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Podcasts, newsletters, artículos, cursos y eventos para profesionales que necesitan entender la
              transformación digital con criterio jurídico, financiero y operativo.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center rounded-lg bg-legabit-charcoal px-5 py-3 text-sm font-semibold text-legabit-ivory transition-colors hover:bg-legabit-petrol"
            >
              Recibir el newsletter
            </Link>
            <Link
              href="/eventos"
              className="inline-flex items-center justify-center rounded-lg border border-legabit-charcoal/15 bg-background px-5 py-3 text-sm font-semibold transition-colors hover:border-legabit-petrol/45 hover:text-legabit-petrol"
            >
              Ver eventos
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="max-w-xl text-sm text-muted-foreground">
              Sigue la conversación en comunidad y medios. El newsletter concentra convocatorias, artículos nuevos y
              lanzamientos de cursos.
            </p>
            <SocialLinks />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
