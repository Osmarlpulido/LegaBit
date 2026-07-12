# Quality, security, and operations plan

## Test strategy

Use a test pyramid organized around architectural boundaries.

### Unit tests

- Domain rules and application services with fake ports.
- Permission evaluation and tenant scoping.
- Schema parsing, normalization, pagination, and error mapping.
- Cache-key, TTL, retry, and idempotency behavior using controlled clocks.

### Integration tests

- MongoDB repositories against a disposable replica set, not mocked driver calls or a standalone instance that cannot exercise transactions.
- HTTP routes through the real backend server with external providers stubbed at the network boundary.
- JWT verification using test keys, issuer, audience, expiry, and rotation cases.
- MongoDB validator/index/data migrations from both an empty database and production-like previous document versions.
- PostgreSQL/Supabase-to-MongoDB migration tests covering ID mapping, nullability, duplicates, orphaned relations, resumability, and reconciliation.

### Contract tests

- Validate every backend response against shared schemas/OpenAPI.
- Verify the typed frontend client against a running backend.
- Add backward-compatibility checks for supported API versions.
- Store sanitized characterization fixtures from current Next.js routes.

### End-to-end tests

- Public navigation and static content smoke tests.
- Newsletter success, duplicate, validation, throttling, and dependency failure.
- Crypto dashboard load, refresh, filtering, currency, and provider degradation.
- Login, callback, session refresh, protected API call, and sign-out.
- Cross-tenant denial before any organization feature ships.
- Wallet connect smoke test, isolated from backend refactor assertions.

## CI quality gates

Each affected workspace must pass formatting, lint, typecheck, unit tests, and build. Backend changes additionally require integration and contract tests. Database changes require migration validation and a backward-compatibility review. Deployment is blocked by a breaking contract unless a new supported version and migration plan exist.

Add dependency graph rules such as:

- `apps/web` must not import `@legabit/db`, backend infrastructure, or server-only provider modules.
- Contract packages must not depend on executable apps or infrastructure packages.
- Application/domain code must not import Fastify, the MongoDB driver, Supabase SDKs, or Next.js.
- Only infrastructure/composition code may read backend secrets.

## Security model

### Trust boundaries

- Treat all browser input, headers, cookies, tokens, and organization IDs as untrusted.
- Verify identity tokens in the backend on every protected request.
- Resolve user and tenant context from verified identity plus backend data.
- Enforce permissions in application services; HTTP middleware may populate context but cannot be the only authorization layer.
- Default deny when identity, membership, or permission information is missing.

### Secrets and configuration

- Keep database, service-role, provider, Stripe, OpenAI, and webhook secrets in backend deployment configuration only.
- Expose only explicitly allowlisted `NEXT_PUBLIC_*` values to the frontend.
- Validate configuration at startup and log only presence/category, never value or connection URL.
- Establish rotation owners and test rotation without downtime.
- Use separate credentials per environment and least privilege for deployment/runtime/migration roles.

### API protection

- Apply route-specific rate limits, especially newsletter and market endpoints.
- Set request body, header, and query limits.
- Use explicit outbound timeouts; retry only safe transient failures with jitter and strict bounds.
- Validate response bodies to prevent accidental data exposure.
- Restrict detailed readiness and diagnostics to infrastructure networks or authenticated operators.
- Define allowed origins even when same-origin proxying is used.
- Sanitize logs and error details for tokens, email addresses, phone numbers, and provider messages.

### Data and privacy

- Clarify legal basis and explicit consent for adding authenticated emails to the newsletter.
- Record only necessary subscription metadata and define retention/deletion workflows.
- Avoid placing personal data in analytics, log fields, cache keys, or tracing attributes.
- Encrypt in transit and use platform-managed encryption at rest.
- Audit sensitive organization, membership, billing, and administrative mutations.

### Tenant isolation

- Require `organizationId` on every tenant-owned entity.
- Construct tenant-scoped repository methods; avoid generic unscoped reads in application code.
- Add negative tests proving one tenant cannot read or mutate another tenant's records.
- MongoDB does not provide row-level security equivalent to PostgreSQL RLS. Enforce tenant scope through repository APIs and authorization, use least-privilege database roles, and make cross-tenant negative tests release-blocking.
- Treat platform super-admin access as exceptional, audited, and separately protected.

## Observability

### Logs

Emit structured logs with timestamp, severity, service/version/environment, request ID, route template, status, latency, and safe actor/tenant pseudonymous identifiers when needed. Propagate `traceparent` and request IDs across proxy and outbound calls. Never log tokens or raw request bodies by default.

### Metrics

At minimum track:

- Request rate, error rate, and latency by route/status.
- Active requests, event-loop delay, memory, and restarts.
- MongoDB command latency/errors, connection-pool utilization, replication lag, elections, transaction aborts/retries, storage/index pressure, and migration state.
- CoinGecko latency, status, cache hit rate, stale responses, and quota consumption.
- Newsletter outcomes: created, already subscribed, validation rejected, throttled, dependency failed—without personal fields.
- Authentication failures by safe reason category and authorization denials.

### Tracing and error reporting

Trace HTTP entry, application use case, database operation, and provider call without recording sensitive arguments. Group exceptions by stable error code and release. Link frontend and backend reports with a request/trace ID visible in safe error responses.

## Initial service objectives

Set final values from the Phase 0 baseline. Initial planning targets may be:

- API availability: 99.9% monthly, excluding agreed maintenance.
- Newsletter p95 server latency: under 500 ms when MongoDB is healthy.
- Market endpoint p95 server latency: under 300 ms on cache hit.
- No unbounded provider or database calls.
- Zero cross-tenant access and zero secret exposure are release-blocking requirements, not error-budget items.

These are proposals and must not become promises until measured against infrastructure and provider constraints.

## Delivery topology

- Build immutable frontend and backend artifacts from the same commit, but deploy them independently.
- Run MongoDB validator/index/data migrations as an explicit, resumable release job before compatible backend rollout, never at process startup.
- Route `/api/v1/*` to the backend at the edge/reverse proxy.
- Keep liveness independent of downstream dependencies; readiness reflects dependencies required to serve traffic.
- Use rolling or canary deployment with graceful connection draining.
- Record deployed API and schema versions in telemetry.

## Runbooks required before final cutover

- Backend rollback while retaining newer compatible document shapes.
- Failed/partial MongoDB migration and source-to-target reconciliation recovery.
- MongoDB connection exhaustion, primary election, replication lag, or outage.
- CoinGecko throttling/outage and cache degradation.
- Supabase Auth outage or signing-key rotation.
- Compromised secret rotation.
- Newsletter abuse spike and rate-limit adjustment.
- Frontend-to-backend routing failure.
- Backup restore and data integrity verification.
