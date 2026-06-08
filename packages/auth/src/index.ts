import type { MembershipRole, PlatformRole } from "@legabit/db";

export type { MembershipRole, PlatformRole };

/** Permisos atómicos para chequeos explícitos en servidor (expandir por dominio). */
export const permissions = [
  "org:read",
  "org:manage",
  "billing:manage",
  "members:invite",
  "members:manage",
  "content:publish",
  "education:manage",
  "crm:read",
  "crm:write",
  "workflow:manage",
  "ai:use_bounded",
  "community:moderate"
] as const;

export type Permission = (typeof permissions)[number];

/** Herencia de roles: mapa rol → permisos. Ajustar según gobernanza LEGABIT. */
export const rolePermissionMatrix: Record<MembershipRole, Permission[]> = {
  organization_owner: [
    "org:read",
    "org:manage",
    "billing:manage",
    "members:invite",
    "members:manage",
    "content:publish",
    "education:manage",
    "crm:read",
    "crm:write",
    "workflow:manage",
    "ai:use_bounded",
    "community:moderate"
  ],
  admin: [
    "org:read",
    "members:invite",
    "content:publish",
    "education:manage",
    "crm:read",
    "crm:write",
    "workflow:manage",
    "ai:use_bounded",
    "community:moderate"
  ],
  legal_operator: ["org:read", "crm:read", "crm:write", "workflow:manage", "ai:use_bounded"],
  educator: ["org:read", "content:publish", "education:manage", "ai:use_bounded"],
  student: ["org:read"],
  client: ["org:read"],
  community_moderator: ["org:read", "community:moderate", "crm:read"]
};

export function membershipHasPermission(role: MembershipRole, permission: Permission): boolean {
  return rolePermissionMatrix[role].includes(permission);
}

export function isPlatformSuperAdmin(platformRole: PlatformRole): boolean {
  return platformRole === "super_admin";
}
