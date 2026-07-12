# Backend and frontend separation roadmap

Status: in progress
Scope: architecture roadmap and incremental migration tracking
Last reviewed: 2026-07-12

## Progress snapshot

| Area | Status | Evidence |
|---|---|---|
| Current-state assessment | Complete | Repository boundaries, risks, and baseline needs are documented |
| Target architecture | Accepted for incremental implementation | Modular API boundary, MongoDB direction, and contract ownership are defined |
| API foundation | In progress | `apps/api`, configuration validation, MongoDB connection management, health endpoints, auth handler, current-user endpoint, errors, logging, shutdown, and tests are in PR #1 |
| Shared API contracts | In progress | `packages/api` is renamed to `packages/api-contracts`; health, error, and current-user contracts are added |
| Market-data extraction | Not started | Existing Next.js crypto route remains active |
| MongoDB provisioning and data migration | Not started | No production database, collections, indexes, validators, or data have been changed |
| Newsletter extraction | Not started | Existing Next.js route and persistence paths remain active |
| Identity and authorization boundary | In progress | Self-hosted Better Auth MongoDB adapter, Fastify handler, trusted origins, secure-cookie configuration, and current-session boundary are implemented; frontend cutover and Supabase removal remain |
| Frontend isolation | Not started | Next.js still owns existing server routes during migration |
| Supabase removal | Planned | Auth, session middleware, admin/PostgREST writes, environment variables, and SDK dependencies remain until replacement cutovers pass |
| Production routing and operations | Blocked | Deployment topology and MongoDB hosting decisions remain open |

## Goal

Evolve LegaBit from a Next.js application that mixes presentation and server responsibilities into two independently deployable applications:

- `apps/web`: the browser-facing Next.js frontend.
- `apps/api`: a TypeScript backend that owns business rules, persistence, privileged integrations, and public/internal API contracts.

The recommended destination is a **modular monolith**, not microservices. It gives the project a real backend boundary without introducing distributed-system overhead before traffic and team size justify it. Domain modules can later be extracted behind stable contracts.

## Why this change

Today, `apps/web` contains pages and UI, but also API routes, database access, Supabase administration, authentication callbacks, health diagnostics, and the CoinGecko adapter. This couples frontend deployments to backend changes and makes security, testing, scaling, and ownership harder.

The repository already has useful monorepo foundations: Turbo, shared packages, Zod schemas, and preliminary auth/analytics/workflow packages. The migration should preserve those foundations while replacing the current Prisma/PostgreSQL persistence layer with MongoDB.

## Roadmap documents

1. [01-current-state.md](./01-current-state.md) — evidence-based inventory and key risks.
2. [02-target-architecture.md](./02-target-architecture.md) — proposed boundaries, dependencies, and request flows.
3. [03-migration-roadmap.md](./03-migration-roadmap.md) — incremental phases, gates, and rollback strategy.
4. [04-workstreams-and-backlog.md](./04-workstreams-and-backlog.md) — implementation-ready epics and acceptance criteria.
5. [05-quality-security-and-operations.md](./05-quality-security-and-operations.md) — testing, security, observability, and delivery requirements.
6. [06-decisions-and-open-questions.md](./06-decisions-and-open-questions.md) — decisions to record before implementation.

## Proposed repository shape

```text
apps/
  web/                    # Next.js frontend and framework adapters only
  api/                    # Independently deployable backend
    src/
      bootstrap/          # Process startup and configuration
      modules/            # Domain/application modules
      infrastructure/     # Database and external providers
      http/               # Transport, middleware, OpenAPI
packages/
  api-contracts/          # Transport-neutral request/response schemas and types
  auth/                   # Shared permission vocabulary; no runtime secrets
  db/                     # MongoDB client, collection validators, indexes, migrations
  ui/                     # Reusable presentation components
  config/                 # Shared TypeScript/lint/test configuration
```

Names are proposals, not implementation commitments. In particular, rename the existing `packages/api` to `packages/api-contracts` before creating `apps/api` so the difference between an executable service and shared contracts is unambiguous.

## Success measures

- The browser and `apps/web` cannot import `@legabit/db` or use service-role credentials.
- MongoDB is the sole application datastore after a verified, reversible data migration.
- All business API traffic is served by `apps/api`, while existing frontend URLs remain stable during migration.
- API contracts are versioned, validated at runtime, and tested for compatibility.
- Authentication has one documented source of truth and authorization is enforced in backend application services.
- Frontend and backend can be built, tested, deployed, scaled, and rolled back independently.
- Newsletter and crypto behavior remain functionally equivalent through each migration phase.

## Non-goals

- No microservice decomposition in this initiative.
- No redesign of the UI or product features.
- No direct one-to-one translation of the relational schema without redesigning document boundaries and indexes.
- No simultaneous migration of static marketing content to a CMS.
- No change to blockchain wallet behavior unless required to isolate server concerns.

## How to use this roadmap

Complete phases in order and treat every exit criterion as a release gate. Create a short Architecture Decision Record (ADR) for each item marked `BLOCKING` in the decisions document. Do not begin route extraction until the identity decision and API deployment topology are approved.
