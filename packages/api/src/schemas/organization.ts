import { z } from "zod";

export const organizationTypeSchema = z.enum(["LAW_FIRM", "STARTUP", "SME", "EDUCATIONAL"]);

export const membershipRoleSchema = z.enum([
  "organization_owner",
  "admin",
  "legal_operator",
  "educator",
  "student",
  "client",
  "community_moderator"
]);

export const createOrganizationInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug inválido"),
  type: organizationTypeSchema
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>;
