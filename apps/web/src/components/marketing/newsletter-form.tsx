"use client";

import { type FormEvent, useState } from "react";
import {
  NEWSLETTER_CONSENT_POLICY_VERSION,
  newsletterSubscribeResponseSchema
} from "@legabit/api-contracts";

import { apiRequest } from "@/lib/api-client";

type NewsletterFormProps = {
  variant?: "card" | "embedded";
  source?: string;
};

export function NewsletterForm({ variant = "card", source = "landing" }: NewsletterFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setFeedback(null);

    try {
      const data = await apiRequest("/api/v1/newsletter/subscriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        schema: newsletterSubscribeResponseSchema,
        body: JSON.stringify({
          email,
          phone,
          displayName: displayName.trim() || undefined,
          source,
          consent: {
            accepted: consentAccepted,
            policyVersion: NEWSLETTER_CONSENT_POLICY_VERSION
          }
        })
      });

      setStatus("success");
      setFeedback(data.message ?? "Listo.");
      setEmail("");
      setDisplayName("");
      setPhone("");
      setConsentAccepted(false);
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

        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <input
            name="consent"
            type="checkbox"
            required
            checked={consentAccepted}
            onChange={(event) => setConsentAccepted(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-legabit-petrol"
          />
          <span>
            Acepto expresamente recibir comunicaciones de Legabit y el tratamiento de mis datos conforme a la
            política de privacidad ({NEWSLETTER_CONSENT_POLICY_VERSION}). Puedo retirar mi consentimiento cuando quiera.
          </span>
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-legabit-charcoal px-4 py-3 text-sm font-semibold text-legabit-ivory transition-colors hover:bg-legabit-petrol disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Enviando…" : "Quiero recibir el newsletter"}
        </button>

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
