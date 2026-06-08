"use client";

import { motion } from "framer-motion";

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
    <section className="border-b border-border bg-gradient-to-b from-legabit-gold/18 via-legabit-ivory/80 to-background">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-3xl space-y-8"
        >
          <Badge>Derecho penal + blockchain/Web3</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Blockchain está redibujando el mapa legal.{" "}
              <span className="font-normal text-muted-foreground">
                Legabit te ayuda a entenderlo con criterio y autoridad.
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Newsletter, comunidad y formación práctica para abogados y profesionales que necesitan claridad jurídica
              — sin ruido técnico y sin convertirse en programadores.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#newsletter"
              className="inline-flex items-center justify-center rounded-lg bg-legabit-charcoal px-5 py-3 text-sm font-semibold text-legabit-ivory transition-colors hover:bg-legabit-petrol"
            >
              Unirme al newsletter
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center rounded-lg border border-legabit-charcoal/15 bg-background px-5 py-3 text-sm font-semibold transition-colors hover:border-legabit-petrol/45 hover:text-legabit-petrol"
            >
              Cómo funciona
            </a>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm text-muted-foreground">
              Síguenos en Discord, Telegram y YouTube; el acceso detallado a la comunidad también lo compartimos desde
              el newsletter.
            </p>
            <SocialLinks />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
