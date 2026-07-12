import { z } from "zod";

export const newsletterSubscribeInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido").max(320),
  displayName: z.string().trim().min(1).max(120).optional(),
  phone: z
    .string()
    .trim()
    .min(7, "Teléfono no válido")
    .max(32, "Teléfono demasiado largo")
    .regex(/^[+()\d\s.-]+$/, "Teléfono no válido"),
  source: z.string().trim().max(64).default("landing")
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeInputSchema>;

export const newsletterSubscribeResponseSchema = z.object({
  ok: z.literal(true),
  alreadySubscribed: z.boolean(),
  message: z.string()
});

export type NewsletterSubscribeResponse = z.infer<typeof newsletterSubscribeResponseSchema>;
