import { z } from "zod";

import { paginationQuerySchema } from "../pagination";

const kebabSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug debe ser kebab-case");

export const adminListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;

// ─── Usuarios ────────────────────────────────────────────────────────────────

export const adminPatchUserSchema = z.object({
  platformRole: z.enum(["none", "super_admin"]).optional(),
  displayName: z.string().min(1).max(200).optional()
});

export type AdminPatchUser = z.infer<typeof adminPatchUserSchema>;

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const adminCreateBlogPostSchema = z.object({
  slug: kebabSlug,
  tag: z.string().min(1).max(50),
  title: z.string().min(1).max(300),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  readingTime: z.string().max(30).optional(),
  author: z.string().min(1).max(100).default("Equipo Legabit"),
  publishedAt: z.coerce.date().optional()
});

export const adminPatchBlogPostSchema = adminCreateBlogPostSchema.partial();

export type AdminCreateBlogPost = z.infer<typeof adminCreateBlogPostSchema>;
export type AdminPatchBlogPost = z.infer<typeof adminPatchBlogPostSchema>;

// ─── Cursos ───────────────────────────────────────────────────────────────────

const lessonInputSchema = z.object({
  order: z.number().int().min(0),
  title: z.string().min(1).max(300),
  durationMin: z.number().int().min(1),
  videoEmbedSrc: z.string().url().optional(),
  brief: z.string().min(1),
  cta: z.string().max(200).optional(),
  project: z.string().max(200).optional()
});

export const adminCreateCourseSchema = z.object({
  slug: kebabSlug,
  tag: z.string().min(1).max(50),
  title: z.string().min(1).max(300),
  excerpt: z.string().min(1).max(500),
  level: z.string().min(1).max(50),
  duration: z.string().min(1).max(50),
  lessons: z.array(lessonInputSchema).default([])
});

export const adminPatchCourseSchema = adminCreateCourseSchema.omit({ lessons: true }).partial();

export type AdminCreateCourse = z.infer<typeof adminCreateCourseSchema>;
export type AdminPatchCourse = z.infer<typeof adminPatchCourseSchema>;

// ─── Podcast ──────────────────────────────────────────────────────────────────

export const adminCreatePodcastEpisodeSchema = z.object({
  slug: kebabSlug,
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  topic: z.string().min(1).max(100),
  duration: z.string().min(1).max(20),
  youtubeUrl: z.string().url().optional(),
  spotifyUrl: z.string().url().optional(),
  publishedAt: z.coerce.date().optional()
});

export const adminPatchPodcastEpisodeSchema = adminCreatePodcastEpisodeSchema.partial();

export type AdminCreatePodcastEpisode = z.infer<typeof adminCreatePodcastEpisodeSchema>;
export type AdminPatchPodcastEpisode = z.infer<typeof adminPatchPodcastEpisodeSchema>;

// ─── Eventos ──────────────────────────────────────────────────────────────────

export const adminCreateEventSchema = z.object({
  slug: kebabSlug,
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  eventDate: z.coerce.date(),
  eventTime: z.string().min(1).max(20),
  format: z.enum(["VIRTUAL", "PRESENCIAL", "HIBRIDO"]),
  location: z.string().min(1).max(200),
  track: z.enum(["DERECHO", "TECNOLOGIA", "FINANZAS", "COMUNIDAD"]),
  status: z.enum(["UPCOMING", "PAST"]).default("UPCOMING")
});

export const adminPatchEventSchema = adminCreateEventSchema.partial();

export type AdminCreateEvent = z.infer<typeof adminCreateEventSchema>;
export type AdminPatchEvent = z.infer<typeof adminPatchEventSchema>;

// ─── Organizaciones ───────────────────────────────────────────────────────────

export const adminCreateOrganizationSchema = z.object({
  name: z.string().min(1).max(200),
  slug: kebabSlug,
  type: z.enum(["LAW_FIRM", "STARTUP", "SME", "EDUCATIONAL"])
});

export const adminPatchOrganizationSchema = adminCreateOrganizationSchema.partial();

export type AdminCreateOrganization = z.infer<typeof adminCreateOrganizationSchema>;
export type AdminPatchOrganization = z.infer<typeof adminPatchOrganizationSchema>;
