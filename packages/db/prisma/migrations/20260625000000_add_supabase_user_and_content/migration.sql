-- Renombrar clerkUserId → supabaseUserId en User
ALTER TABLE "User" RENAME COLUMN "clerkUserId" TO "supabaseUserId";

-- Actualizar nombre del índice único
ALTER INDEX IF EXISTS "User_clerkUserId_key" RENAME TO "User_supabaseUserId_key";

-- Actualizar índice compuesto si existe
DROP INDEX IF EXISTS "User_clerkUserId_idx";
CREATE INDEX IF NOT EXISTS "User_supabaseUserId_idx" ON "User"("supabaseUserId");

-- Renombrar clerkOrganizationId → externalOrganizationId en Organization
ALTER TABLE "Organization" RENAME COLUMN "clerkOrganizationId" TO "externalOrganizationId";
ALTER INDEX IF EXISTS "Organization_clerkOrganizationId_key" RENAME TO "Organization_externalOrganizationId_key";
DROP INDEX IF EXISTS "Organization_clerkOrganizationId_idx";

-- Enums para contenido
CREATE TYPE "EventFormat" AS ENUM ('VIRTUAL', 'PRESENCIAL', 'HIBRIDO');
CREATE TYPE "EventTrack" AS ENUM ('DERECHO', 'TECNOLOGIA', 'FINANZAS', 'COMUNIDAD');
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'PAST');

-- Tabla BlogPost
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readingTime" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Equipo Legabit',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- Tabla Course
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE INDEX "Course_slug_idx" ON "Course"("slug");

-- Tabla Lesson
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "videoEmbedSrc" TEXT,
    "brief" TEXT NOT NULL,
    "cta" TEXT,
    "project" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lesson_courseId_order_idx" ON "Lesson"("courseId", "order");

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla PodcastEpisode
CREATE TABLE "PodcastEpisode" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "youtubeUrl" TEXT,
    "spotifyUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PodcastEpisode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PodcastEpisode_slug_key" ON "PodcastEpisode"("slug");
CREATE INDEX "PodcastEpisode_publishedAt_idx" ON "PodcastEpisode"("publishedAt");

-- Tabla LegabitEvent
CREATE TABLE "LegabitEvent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventTime" TEXT NOT NULL,
    "format" "EventFormat" NOT NULL,
    "location" TEXT NOT NULL,
    "track" "EventTrack" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LegabitEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegabitEvent_slug_key" ON "LegabitEvent"("slug");
CREATE INDEX "LegabitEvent_eventDate_idx" ON "LegabitEvent"("eventDate");
CREATE INDEX "LegabitEvent_status_idx" ON "LegabitEvent"("status");
