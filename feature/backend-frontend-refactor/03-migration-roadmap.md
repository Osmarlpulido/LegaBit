# Migration roadmap

Status: in progress
Last reviewed: 2026-07-12

## Phase status

| Phase | Status | Current result |
|---|---|---|
| Phase 0 — decisions and baseline | In progress | Architecture inventory, self-hosted identity direction, and roadmap are complete; topology, MongoDB hosting/modeling, consent, and live-data baseline decisions remain open |
| Phase 1 — backend foundation | In progress | API workspace, contracts rename, config validation, MongoDB connection lifecycle, health/auth/current-user routes, structured errors, CORS, logging, shutdown, tests, reproducible OpenAPI generation, and separately scheduled CI jobs are implemented; deployment, production routing, and semantic compatibility comparison remain |
| Phase 2 — market data | In progress | Versioned contracts, backend route/provider resilience and validation, caching/coalescing, bounded telemetry, nullable-field handling, stale-response protection, tests, and frontend client cutover are implemented; production telemetry observation and legacy removal remain |
| Phase 3 — MongoDB/newsletter migration | Not started | No datastore or route cutover has occurred |
| Phase 4 — identity and authorization | In progress | Better Auth backend, same-origin routing, frontend client, login/session/sign-out migration, and Supabase auth-code removal are implemented; live Google/MongoDB integration, account policy, tenancy, and authorization remain |
| Phase 5 — frontend cleanup | In progress | Auth and market state use the typed backend client/query layer, and import boundaries are enforced with narrow legacy-route exceptions; newsletter, crypto compatibility, and diagnostic routes remain in Next.js |
| Phase 6 — operational hardening | Not started | Foundational health/logging work has begun, but production hardening has not |

## Strategy

Use an incremental strangler migration. Establish contracts and deployment plumbing first, move one low-risk route at a time, and keep compatibility rewrites until traffic proves the old path is unused. Every phase must be independently releasable and reversible.

Effort labels are relative (`S`, `M`, `L`) and should be converted into team estimates after the blocking decisions are made.

## Phase 0 — decisions and behavioral baseline (`M`)

Phase status: in progress

Implementation note: the production-readiness review findings for shared process-level caching, request coalescing, nullable provider fields, runtime upstream validation, and out-of-order frontend responses are resolved. Production telemetry observation, rollback validation, and legacy route removal remain.

### Work

- Approve ADRs for identity provider, API framework, deployment topology, URL routing, and persistence path.
- Inventory actual production/staging configuration without copying secrets into documentation.
- Reconcile live PostgreSQL/Supabase schema against Prisma migrations and the manual newsletter SQL.
- Profile source data and approve the MongoDB collection, identifier, embedding/reference, index, validation, and consistency design.
- Capture current API response fixtures and auth journeys as characterization tests.
- Define service-level indicators and initial objectives for availability and latency.
- Confirm newsletter consent and retention requirements with product/legal stakeholders.

### Exit criteria

- All `BLOCKING` decisions have owners and approved outcomes.
- Baseline behavior is executable in CI or a documented test environment.
- One authoritative identity and a MongoDB migration/versioning mechanism are selected.
- Rollback owner and deployment environments are documented.

## Phase 1 — backend foundation (`L`)

Phase status: in progress

### Work

- Add the executable `apps/api` workspace with production and local entrypoints.
- Rename `packages/api` to `packages/api-contracts` and retain compatibility temporarily if needed.
- Add validated environment configuration that fails fast without logging secrets.
- Establish HTTP conventions: versioning, errors, request IDs, logging, validation, and OpenAPI.
- Add liveness/readiness endpoints and graceful shutdown.
- Add unit, integration, and contract-test harnesses with an isolated MongoDB replica set.
- Add dependency-boundary rules preventing frontend database/backend imports.
- Create CI tasks and a deployable non-production API.
- Configure same-origin routing from `/api/v1/*` to the backend.

### Exit criteria

- A separately deployed API responds through the frontend origin.
- CI builds and tests frontend and backend independently.
- OpenAPI and contract artifacts are reproducible.
- No product route has moved yet; rollback is removal of the rewrite/deployment.

## Phase 2 — extract market data (`M`)

Phase status: in progress

Market data is first because it is read-only and has no user data or database migration.

### Work

- Define LegaBit-owned market query and response schemas.
- Implement a CoinGecko adapter with timeout, bounded retry, error translation, and quota-aware caching.
- Validate currency, page, and page-size inputs.
- Add request coalescing and stale-on-provider-error behavior if approved.
- Switch the frontend API client to `/api/v1/markets` behind a runtime release flag or proxy alias.
- Compare payloads, latency, error rate, and provider request volume.
- Remove the Next.js crypto handler and frontend provider adapter after the observation window.

### Exit criteria

- Contract and integration tests cover normal, invalid, throttled, timeout, and upstream-failure cases.
- Production telemetry meets the agreed latency/error/quota targets for an observation window.
- Rollback is a routing/flag change; no data rollback is required.

## Phase 3 — migrate persistence and extract newsletter (`L–XL`)

Phase status: not started

### Work

- Provision MongoDB with separate application and migration credentials, backups, monitoring, and replica-set transaction support.
- Implement versioned collection validators, index definitions, and idempotent migration tooling.
- Build a repeatable PostgreSQL/Supabase-to-MongoDB export/transform/load process with stable ID mapping.
- Validate source/target counts, uniqueness, required fields, relationships, and sampled record checksums.
- Define newsletter repository and application service boundaries.
- Implement the repository with the official MongoDB driver, unique normalized-email index, and atomic idempotent subscription semantics.
- Add public endpoint rate limiting, abuse controls, safe errors, and consent/source metadata.
- Move the auth-triggered newsletter behavior out of the OAuth callback into an explicit backend use case/event, subject to approved consent semantics.
- Switch the frontend form to `/api/v1/newsletter/subscriptions`.
- Run shadow reads or staged traffic comparison without creating conflicting dual writes. If a dual-write window is unavoidable, document ownership, ordering, reconciliation, failure repair, and a strict expiry.
- Freeze writes briefly or run a final change-data capture/delta sync before switching MongoDB to source of truth.
- Retire service-role and Prisma imports from `apps/web` after the observation window; remove Prisma from the repository only after all consumers and rollback windows expire.

### Exit criteria

- MongoDB is the verified source of truth and one code path writes `newsletterSubscribers`.
- Duplicate requests are safe and covered by concurrency tests.
- Existing records and relationships are reconciled with a signed-off count/constraint/checksum report.
- Required collection validators, unique/compound indexes, backup, restore, and rollback procedures are verified.
- Frontend deployment has no database or service-role secret.
- Rollback procedures account for MongoDB writes made after cutover; rollback is not considered safe unless reverse synchronization or an accepted maintenance/data-reconciliation procedure exists.

## Phase 4 — identity and authorization boundary (`L`)

Phase status: in progress; D-01 is resolved

### Work

- Integrate Better Auth with the existing MongoDB client and mount `/api/auth/*` before general JSON request handling.
- Configure signed session cookies, exact trusted origins, base URL, Google OAuth, rate limiting, and secret rotation.
- Model application-owned profiles keyed by the Better Auth user ID and provision them idempotently.
- Implement server-side session resolution and current-actor request context behind an application-owned interface.
- Implement organization membership resolution and permission checks in application services.
- Add audit logging for sensitive mutations.
- Provide `/api/v1/me` and protected-route contract tests.
- Keep frontend guards for UX, while testing that backend denial is authoritative.
- Replace Supabase browser/server clients, middleware, callback, and sign-out flow with the Better Auth client and backend endpoints.
- Migrate or require re-authentication for existing Supabase users according to the approved account-migration policy.
- Remove Supabase SDK packages and all Supabase environment variables only after the observation and rollback window.

### Exit criteria

- Invalid, expired, revoked, forged, and cross-origin sessions are rejected.
- Cross-tenant and privilege-escalation tests pass.
- Better Auth user IDs map uniquely to application profiles and memberships.
- Google callback and session establishment are backend-owned and no Supabase runtime dependency remains.

## Phase 5 — frontend boundary cleanup (`M`)

Phase status: in progress

### Work

- Route every remote call through the typed API client.
- Move remote crypto state/polling to TanStack Query; retain Zustand only for local UI state if still useful.
- Remove Next.js business API routes, admin clients, provider adapters, and database dependencies.
- Split frontend code by feature and presentation layer.
- Grow `packages/ui` only for genuinely reused design-system components.
- Add frontend unit/component tests and end-to-end critical journeys.
- Remove compatibility aliases after an agreed zero-traffic window.

### Exit criteria

- Automated dependency checks prove the frontend cannot import backend or database code.
- `apps/web` needs only public/frontend configuration and auth-session configuration.
- Critical page, login, newsletter, dashboard, and wallet journeys pass end to end.
- Frontend and API releases can be rolled back independently within the compatibility window.

## Phase 6 — operational hardening and scale validation (`M–L`)

Phase status: not started

### Work

- Run load tests for public newsletter and market endpoints.
- Validate horizontal scaling, shared-cache need, connection-pool limits, and graceful shutdown.
- Add dashboards and alerts for latency, errors, saturation, auth failures, database health, and provider quota.
- Exercise database restore, secret rotation, API rollback, and dependency outage runbooks.
- Add dependency and container/image scanning where applicable.
- Review module boundaries before adding organizations, billing, AI, workflows, or analytics implementations.

### Exit criteria

- SLO alerts are actionable and tested.
- Restore and rollback drills meet recovery objectives.
- Capacity limits and scaling triggers are recorded from evidence.
- The old Next.js backend paths and unused credentials are removed.

## Suggested release sequence per route

1. Document and test the old contract.
2. Implement the new backend contract and compatibility behavior.
3. Deploy backend without traffic.
4. Verify readiness and synthetic requests.
5. Route internal or small-percentage traffic if the platform supports it.
6. Compare telemetry and data outcomes.
7. Increase traffic gradually.
8. Hold an observation window.
9. Remove old code in a separate change.
10. Remove compatibility routes only after verified zero use.

## Rollback principles

- Keep document-shape changes backward-compatible until both deployables have passed the observation window.
- Keep PostgreSQL/Supabase available read-only through the agreed database rollback window; do not claim rollback safety without a plan for post-cutover MongoDB writes.
- Never rely on reverting a destructive migration during incident response.
- Maintain old and new route compatibility during cutover, but ensure only one path performs a mutation for a given request.
- Version contracts so a previous frontend can call a newer backend during rollback.
- Make release flags server-controlled and observable; assign an owner and expiry date to each flag.
