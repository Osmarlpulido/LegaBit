"use client";

import { type FormEvent, useState } from "react";

type NewsletterFormProps = {
  variant?: "card" | "embedded";
  source?: string;
};

export function NewsletterForm({ variant = "card", source = "landing" }: NewsletterFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          displayName: displayName.trim() || undefined,
          source
        })
      });

      const data = (await res.json()) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        message?: string;
        code?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setFeedback(data.message ?? "No se pudo completar el registro.");
        return;
      }

      setStatus("success");
      setFeedback(data.message ?? "Listo.");
      if (data.alreadySubscribed !== true) {
        setEmail("");
        setDisplayName("");
        setPhone("");
      }
    } catch {
      setStatus("error");
      setFeedback("Error de red. Intenta de nuevo.");
    }
  }

  const wrapper =
    variant === "card"
      ? "rounded-2xl border border-legabit-gold/25 bg-legabit-gold/10 p-6 sm:p-8"
      : "";

  return (
    <form id="newsletter" onSubmit={onSubmit} className={wrapper}>
      <div className="space-y-5">
        <div>
          <label htmlFor="nw-name" className="mb-1.5 block text-sm font-medium text-foreground">
            Nombre
          </label>
          <input
            id="nw-name"
            name="displayName"
            type="text"
            required
            autoComplete="name"
            value={displayName}
            onChange={(ev) => setDisplayName(ev.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-legabit-petrol/25"
          />
        </div>
        <div>
          <label htmlFor="nw-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Correo
          </label>
          <input
            id="nw-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-legabit-petrol/25"
          />
        </div>
        <div>
          <label htmlFor="nw-phone" className="mb-1.5 block text-sm font-medium text-foreground">
            Teléfono
          </label>
          <input
            id="nw-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(ev) => setPhone(ev.target.value)}
            placeholder="+57 300 000 0000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-legabit-petrol/25"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-legabit-charcoal px-4 py-3 text-sm font-semibold text-legabit-ivory transition-colors hover:bg-legabit-petrol disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Enviando…" : "Quiero recibir el newsletter"}
        </button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Al suscribirte aceptas recibir comunicaciones de Legabit. Puedes darte de baja cuando quieras.
        </p>

        {feedback ? (
          <p
            role="status"
            className={
              status === "success"
                ? "text-sm font-medium text-foreground"
                : "text-sm font-medium text-red-700"
            }
          >
            {feedback}
          </p>
        ) : null}
      </div>
    </form>
  );
}
