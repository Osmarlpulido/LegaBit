# Workstreams and backlog

Status: in progress
Last reviewed: 2026-07-12

This document turns the migration phases into epics. Each epic should become smaller delivery tickets only after the blocking ADRs are approved.

## Epic A — architecture governance

Status: in progress

- A1. Record self-hosted Better Auth with MongoDB identity ADR (accepted direction; implementation details pending).
- A2. Record backend runtime/framework ADR (`BLOCKING`).
- A3. Record deployment and same-origin routing ADR (`BLOCKING`).
- A4. Record MongoDB driver, hosting, consistency, ID, modeling, and schema-version ownership ADR (`BLOCKING`).
- A5. Define module dependency rules and ownership map.
- A6. Define API compatibility and deprecation policy.

Acceptance: ADRs state context, decision, alternatives, consequences, owner, review date, and migration impact.

## Epic B — contracts and API client

Status: in progress — package rename, foundation contracts, reproducible OpenAPI generation, drift checking, and compatibility rules are delivered; versioned product contracts, semantic compatibility comparison, and frontend client remain

- B1. Rename `packages/api` to a clearly non-executable contracts package.
- B2. Define versioned newsletter, market, identity, health, and error schemas.
- B3. **Done:** Generate/check a committed OpenAPI artifact from canonical Zod schemas.
- B4. **In progress:** Backend builds reject OpenAPI drift; semantic comparison against the prior supported contract and full CI wiring remain.
- B5. Add a typed frontend client with base URL, auth, request IDs, timeouts, and error mapping.
- B6. **In progress:** Additive versus breaking changes are documented; concrete support windows remain to be approved.

Acceptance: malformed requests and responses fail tests; a prior supported frontend contract remains compatible.

## Epic C — backend platform

Status: in progress — executable API, validated configuration, request IDs, logging, centralized safe errors, health checks, graceful shutdown, MongoDB connection boundary, and initial tests delivered; routing, security defaults, integration database, full CI, and deployment remain

- C1. Scaffold executable API and composition root.
- C2. Validate environment at startup with secret-safe diagnostics.
- C3. Add request ID propagation and structured logs.
- C4. Add centralized error handling and response validation.
- C5. Add liveness, readiness, graceful shutdown, and dependency timeouts.
- C6. Add CORS/headers/body-size/rate-limit defaults appropriate to topology.
- C7. Add local development orchestration and isolated integration database.
- C8. Add backend build, lint, typecheck, test, and deploy pipelines.

Acceptance: the empty service is production-deployable, observable, safely terminates, and has no product traffic.

## Epic D — market-data module

Status: in progress — provider-neutral contracts, validated use case, resilient runtime-validated CoinGecko adapter, safe errors, process-wide cache/coalescing with stale fallback, bounded provider/cache metrics, nullable-field handling, stale frontend response protection, route/provider tests, and frontend client cutover are delivered; production observation and legacy removal remain

- D1. **Done:** Define provider-neutral market models.
- D2. **Done:** Implement validated query use case.
- D3. **Done:** Implement CoinGecko adapter with explicit timeout/retry policy.
- D4. **Done for the current single-process topology:** Implement process-wide cache, request coalescing, and stale-on-provider-error policy. Reassess external shared caching before horizontal scaling.
- D5. **Done:** Add bounded provider request/retry/duration and cache outcome metrics plus safe error mapping.
- D6. **In progress:** The dashboard uses `/api/v1/markets`; production telemetry observation and rollback validation remain.
- D7. Delete frontend-owned provider/server code after observation.

Acceptance: provider changes do not affect the frontend contract; load does not exceed the agreed provider quota.

### Independent review follow-up (2026-07-12)

The initial market-data implementation is not production-ready until these review findings are resolved:

- **High:** Add shared caching and request coalescing before production cutover. The dashboard polls every 60 seconds and the backend currently performs two CoinGecko calls per client request, regressing the shared caching behavior of the legacy Next.js route and risking provider-quota exhaustion.
- **High:** Reconcile the market contract with legitimate nullable CoinGecko fields such as price, market cap, rank, percentage changes, volume, and circulating supply. Define explicit normalization/presentation behavior and add realistic payload tests so valid provider data cannot become an internal server error.
- **Medium:** Runtime-validate successful provider responses inside the CoinGecko adapter and translate malformed or changed upstream payloads to the safe `SERVICE_UNAVAILABLE` envelope.
- **Medium:** Prevent stale frontend requests from overwriting a newer currency selection by using cancellation, a request token, or an equivalent current-request guard.
- Add tests for nullable and malformed provider payloads, provider-call coalescing/cache behavior, and out-of-order frontend responses.

These items are part of D1, D4, D5, D6, and G2 completion and must be closed before the observation window begins.

Resolution (2026-07-12): all implementation and test findings above are closed. The observation window can begin once production telemetry and rollback validation are available.

## Epic E — newsletter module and data reconciliation

Status: not started

- E1. Compare live PostgreSQL/Supabase schema and data to Prisma history in every environment.
- E2. Design collections using access patterns, bounded-growth rules, references/embedding, consistency boundaries, validators, and indexes.
- E3. Decide ID representation and create deterministic source-to-target ID mapping.
- E4. Create a repeatable export/transform/load plus delta-reconciliation plan.
- E5. Provision MongoDB replica sets, least-privilege users, backups, alerts, and migration runner.
- E6. Create versioned, idempotent validator/index/data migrations.
- E7. Define consent, normalization, duplicate, retention, and deletion rules.
- E8. Implement application service and MongoDB repository using atomic operations.
- E9. Implement public abuse controls and privacy-safe telemetry.
- E10. Define concurrency-safe idempotency and transaction retry behavior and test both.
- E11. Rehearse full load, delta sync, verification, cutover, and rollback on production-like data.
- E12. Cut over form traffic and verify data outcomes.
- E13. Decouple newsletter enrollment from OAuth callback.
- E14. Remove manual/alternate write paths and Prisma only after the rollback window.

Acceptance: MongoDB is the sole verified write path; no records or required relationships are lost; validators and indexes are installed; duplicate/concurrent requests are safe; backup/restore and cutover recovery are rehearsed; consent semantics are approved.

## Epic F — identity, tenancy, and authorization

Status: in progress — backend and frontend Better Auth session surfaces are implemented; live provider validation, account policy, domain authorization, and remaining Supabase data removal remain

- F1. **Done:** Integrate Better Auth with the shared MongoDB client and official MongoDB adapter.
- F2. **Done:** Mount and test same-origin `/api/auth/*` Fastify handling.
- F3. **In progress:** Configure Better Auth secret handling, exact trusted origins, secure cookies, Google OAuth, and rate limiting. Rotation procedure and production credentials remain.
- F4. **Not started:** Define application profiles keyed by Better Auth user ID and idempotent provisioning.
- F5. **In progress:** Implement current actor and active-tenant resolution behind application-owned interfaces. Current actor is delivered; tenant resolution remains.
- F6. Define Supabase account migration or forced re-authentication and reconciliation.
- F7. **Done:** Replace frontend Supabase clients, middleware, callback, and sign-out behavior.
- F8. Enforce permissions in application services, default deny.
- F9. Add transactional audit logging for sensitive actions.
- F10. Add forged/revoked session, CSRF/origin, cross-tenant, role downgrade, revoked-membership, and super-admin tests.
- F11. **In progress:** Supabase SSR/auth SDK paths and configuration are removed; the admin/PostgREST SDK and data configuration remain until newsletter cutover verification.

Acceptance: no caller can select an arbitrary tenant/user identity; backend authorization tests cover every protected use case.

## Epic G — frontend isolation

Status: in progress — same-origin auth/API rewrites and Better Auth frontend client are delivered; product API migrations remain

- G1. Add forbidden-import rules for `@legabit/db`, backend modules, and server secrets.
- G2. Migrate all server state to the central API client/query layer.
- G3. Remove privileged Supabase client and database dependencies.
- G4. Reduce auth callback to session-establishment responsibilities.
- G5. Organize UI by feature and promote only reusable components to `packages/ui`.
- G6. Add component and critical-journey end-to-end tests.
- G7. Prove independent frontend rollback against supported backend versions.

Acceptance: a frontend build cannot access privileged infrastructure and can deploy without backend-only environment variables.

## Epic H — delivery and operations

Status: not started — basic health and logging exist, but production delivery and operational controls do not

- H1. Define environments, promotion flow, and independent release versioning.
- H2. Implement migration job separate from web/API process startup.
- H3. Add dashboards, SLOs, paging thresholds, and runbooks.
- H4. Add MongoDB point-in-time backup/restore, replica-set failure, and recovery drills.
- H5. Add secret ownership and rotation procedure.
- H6. Add dependency vulnerability and license checks.
- H7. Load test and document capacity/connection-pool limits.
- H8. Add compatibility-route and feature-flag expiry automation.

Acceptance: on-call can detect, diagnose, roll back, and recover the API using documented and rehearsed procedures.

## Definition of done for every migration ticket

- Contract and acceptance criteria are explicit.
- Unit/integration/contract tests are added at the correct boundary.
- Security and tenant implications are reviewed.
- Logs and metrics are useful without personal data or secrets.
- Deployment and rollback steps are documented.
- Backward compatibility is preserved for the agreed window.
- Dead compatibility code has an owner and removal date.
- Relevant roadmap/ADR documentation is updated.

## Dependency order

```text
Architecture decisions
  -> contracts + backend platform
       -> market extraction
       -> data reconciliation -> newsletter extraction
       -> identity foundation -> tenancy/authorization
  -> frontend isolation (incremental throughout)
  -> scale validation and legacy removal
```

Market extraction can proceed while newsletter schema reconciliation is underway. Identity schema changes must not proceed until the provider ADR is approved. Operational foundations begin with the backend platform and continue through every phase.
