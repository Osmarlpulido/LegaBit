import { z } from "zod";

export const newsletterSubscribeInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido").max(320),
  displayName: z.union([z.string(), z.null()]).transform((value) => {
    if (value == null) return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed.slice(0, 120);
  }),
  phone: z
    .string()
    .trim()
    .min(7, "Teléfono no válido")
    .max(32, "Teléfono demasiado largo")
    .regex(/^[+()\d\s.-]+$/, "Teléfono no válido"),
  source: z.string().trim().max(64).default("landing")
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeInputSchema>;
