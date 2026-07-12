# Workstreams and backlog

This document turns the migration phases into epics. Each epic should become smaller delivery tickets only after the blocking ADRs are approved.

## Epic A — architecture governance

- A1. Record identity-provider ADR (`BLOCKING`).
- A2. Record backend runtime/framework ADR (`BLOCKING`).
- A3. Record deployment and same-origin routing ADR (`BLOCKING`).
- A4. Record MongoDB driver, hosting, consistency, ID, modeling, and schema-version ownership ADR (`BLOCKING`).
- A5. Define module dependency rules and ownership map.
- A6. Define API compatibility and deprecation policy.

Acceptance: ADRs state context, decision, alternatives, consequences, owner, review date, and migration impact.

## Epic B — contracts and API client

- B1. Rename `packages/api` to a clearly non-executable contracts package.
- B2. Define versioned newsletter, market, identity, health, and error schemas.
- B3. Generate/check OpenAPI from the canonical schemas.
- B4. Add contract compatibility checks to CI.
- B5. Add a typed frontend client with base URL, auth, request IDs, timeouts, and error mapping.
- B6. Document additive versus breaking changes and support windows.

Acceptance: malformed requests and responses fail tests; a prior supported frontend contract remains compatible.

## Epic C — backend platform

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

- D1. Define provider-neutral market models.
- D2. Implement validated query use case.
- D3. Implement CoinGecko adapter with explicit timeout/retry policy.
- D4. Implement cache, request coalescing, and stale policy.
- D5. Add provider quota/error metrics and safe error mapping.
- D6. Cut over the dashboard behind compatibility routing.
- D7. Delete frontend-owned provider/server code after observation.

Acceptance: provider changes do not affect the frontend contract; load does not exceed the agreed provider quota.

## Epic E — newsletter module and data reconciliation

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

- F1. Implement JWT verification with issuer/audience/key-rotation tests.
- F2. Define provider-neutral external identity schema.
- F3. Backfill and validate existing identity mappings.
- F4. Implement idempotent internal-user provisioning.
- F5. Implement current actor and active-tenant resolution.
- F6. Enforce permissions in application services, default deny.
- F7. Add transactional audit logging for sensitive actions.
- F8. Add cross-tenant, role downgrade, revoked-membership, and super-admin tests.

Acceptance: no caller can select an arbitrary tenant/user identity; backend authorization tests cover every protected use case.

## Epic G — frontend isolation

- G1. Add forbidden-import rules for `@legabit/db`, backend modules, and server secrets.
- G2. Migrate all server state to the central API client/query layer.
- G3. Remove privileged Supabase client and database dependencies.
- G4. Reduce auth callback to session-establishment responsibilities.
- G5. Organize UI by feature and promote only reusable components to `packages/ui`.
- G6. Add component and critical-journey end-to-end tests.
- G7. Prove independent frontend rollback against supported backend versions.

Acceptance: a frontend build cannot access privileged infrastructure and can deploy without backend-only environment variables.

## Epic H — delivery and operations

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
