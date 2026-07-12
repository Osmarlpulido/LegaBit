# Current-state assessment

Status: complete
Last reviewed: 2026-07-12

## Executive summary

LegaBit is a Yarn/Turbo TypeScript monorepo with one executable application, `apps/web`. The application is primarily a marketing and education site with a crypto dashboard, newsletter subscription, Google authentication through Supabase, and a wallet connector. It also contains the current backend behavior in Next.js route handlers.

The shared packages suggest a broader multi-tenant platform direction, but most are contracts or placeholders rather than runtime services. The Prisma model describes users, organizations, memberships, invitations, audit logs, and newsletter subscribers; the active UI currently exercises only newsletter persistence.

## Runtime inventory

| Area | Current location | Current responsibility | Target owner |
|---|---|---|---|
| Marketing, blog, courses, events, podcast | `apps/web/src/app`, `apps/web/src/lib/*-data.ts` | Pages and in-repo static content | Frontend initially |
| Crypto dashboard | `apps/web/src/app/dashboard`, components, Zustand store | Rendering, filtering, polling | Frontend |
| Crypto provider adapter | `apps/web/src/lib/coingecko.ts` | Secret-bearing external API calls and caching | Backend |
| Crypto HTTP endpoint | `apps/web/src/app/api/crypto/route.ts` | Query parsing and response construction | Backend |
| Newsletter endpoint | `apps/web/src/app/api/newsletter/route.ts` | Validation, persistence selection, error mapping | Backend |
| Data diagnostics | `apps/web/src/app/api/health/data/route.ts` | Configuration and live datastore diagnostics | Backend, split into health/readiness |
| Browser/SSR authentication | `apps/web/src/lib/supabase`, middleware, auth routes | OAuth, session cookies, user lookup | Frontend adapter plus backend verification |
| Privileged Supabase access | `apps/web/src/lib/supabase/admin.ts` | Service-role database writes | Backend only |
| Persistence | `packages/db` | Current Prisma/PostgreSQL schema, client, migrations; separate manual SQL | Replace with backend-owned MongoDB infrastructure |
| API schemas/errors | `packages/api` | Zod schemas, pagination, error types | Shared contracts, renamed |
| Authorization vocabulary | `packages/auth` | Role-to-permission mapping | Backend enforcement; types may be shared |
| UI package | `packages/ui` | One shared wordmark component | Frontend design system |
| AI, analytics, workflows | `packages/ai`, `analytics`, `workflows` | Type/constants only | Future backend adapters/modules |

## Current request flows

### Newsletter

1. The browser posts to `/api/newsletter`.
2. A Next.js route validates with a shared Zod schema.
3. At runtime it chooses one of two persistence paths:
   - Supabase PostgREST using a service credential, preferred when configured.
   - Prisma/PostgreSQL when only `DATABASE_URL` is available.
4. The route maps duplicate and infrastructure errors into JSON.

This dual-write-path design creates different runtime behavior across environments and bypasses a single persistence abstraction.

### Crypto dashboard

1. The browser polls `/api/crypto` every 60 seconds.
2. The Next.js route parses query parameters without a shared schema.
3. `coingecko.ts` calls two CoinGecko endpoints.
4. The route returns a combined payload with CDN cache headers.

The approach is small and functional, but its provider key, throttling policy, caching, and failures are tied to the frontend deployment.

### Authentication

1. Browser and server helpers use Supabase Auth.
2. Next middleware refreshes/validates session claims.
3. The OAuth callback exchanges the code for a session.
4. The callback also performs a privileged newsletter insert as a side effect.

Authentication and the unrelated newsletter domain are coupled in the callback. More importantly, the Prisma schema and comments model Clerk IDs while the runtime uses Supabase. Environment configuration also includes both providers. This must be resolved before expanding user or organization features.

## Existing strengths to preserve

- Monorepo task orchestration and workspace packages are already established.
- TypeScript is used throughout the active code.
- Prisma migrations provide a starting point for controlled schema evolution.
- The existing Prisma schema is a useful inventory of entities and constraints for the MongoDB redesign, even though it will not be retained at runtime.
- Zod schemas already establish a pattern for runtime contract validation.
- Next.js pages cleanly separate many server and client components.
- The crypto dashboard calls a same-origin endpoint, which enables transparent backend cutover.
- Basic error codes, pagination, RBAC vocabulary, and audit entities already exist.

## Key risks and gaps

### Architecture

- Only the frontend is independently executable; all server behavior shares its lifecycle.
- Framework route handlers contain transport, orchestration, provider, and persistence logic together.
- `apps/web` directly depends on `@legabit/db`.
- Static content, UI, server integrations, and domain concerns share the same source tree.
- Package boundaries are not enforced by lint or dependency rules.

### Data and identity

- Supabase PostgREST and Prisma are competing persistence paths for the same table.
- A manual Supabase SQL file exists alongside Prisma migrations, creating schema-drift risk.
- Moving to MongoDB is a database-engine and data-model migration, not merely removing an ORM; joins, constraints, indexes, transactions, IDs, and migration tooling must be redesigned explicitly.
- The schema expects `clerkUserId`; the running authentication implementation uses Supabase.
- Tenant models and permission helpers exist, but no active request context or backend enforcement connects them.
- The auth callback silently attempts a newsletter write, so auth success and marketing consent semantics are blurred.

### API quality

- No explicit API versioning or OpenAPI document exists.
- Request validation and error envelopes are inconsistent between routes.
- Crypto numeric parameters can become `NaN`, negative, or otherwise invalid.
- Provider error strings can be returned to clients.
- The diagnostic endpoint exposes configuration shape and project URL; production access policy is implicit.
- No stated idempotency, rate-limiting, timeout, retry, or circuit-breaking policy exists.

### Testing and operations

- No tests or test scripts are present beyond type checking and build tasks.
- There is no API integration-test environment or end-to-end contract suite.
- No structured logging, tracing, metrics, request IDs, or error-reporting integration is implemented.
- Health, readiness, and dependency diagnostics are not separated.
- Deployment topology, secret ownership, backup/restore, and rollback procedures are undocumented.

## Baseline to capture before migration

Before implementation, record:

- Successful and error response fixtures for all three current API routes.
- Newsletter duplicate behavior for both existing persistence modes.
- Crypto response latency, cache behavior, provider quota use, and failure behavior.
- Auth login, callback, refresh, sign-out, and redirect behavior.
- Current build/typecheck duration and production bundle/deployment characteristics.
- Database schema state in every environment compared with Prisma migrations.
- Current row counts, orphan checks, unique-constraint violations, and ID relationships needed for MongoDB reconciliation.

These fixtures become characterization tests and stop the refactor from accidentally changing product behavior.
