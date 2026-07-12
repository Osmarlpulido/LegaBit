# Target architecture

Status: accepted for incremental implementation
Implementation progress: API foundation in progress; product and data cutovers not started
Last reviewed: 2026-07-12

## Architectural style

Use an independently deployable **TypeScript modular monolith** for the backend. Organize it by business capability, with explicit application and infrastructure boundaries. Do not divide the initial backend into networked services.

Recommended starting stack:

- Node.js 20+ and TypeScript, aligned with the repository.
- Fastify as the HTTP runtime because it is small, schema-friendly, and does not impose a second application architecture.
- Zod for request, response, and configuration validation.
- OpenAPI generated from or checked against those schemas.
- MongoDB as the only application persistence path, accessed through the official MongoDB Node.js driver behind repository interfaces.
- Better Auth hosted inside `apps/api`, backed by MongoDB, as the self-hosted identity and session system.

The framework choice is reversible and must be captured in an ADR. The enduring design is the boundary between transport, application logic, domain policy, and infrastructure—not Fastify itself.

## System context

```text
Browser
  |-- pages/assets/auth initiation --> apps/web (Next.js)
  |-- /api/v1/* --------------------> apps/api (via same-origin proxy initially)
                                           |-- MongoDB
                                           |-- Better Auth + MongoDB sessions
                                           |-- CoinGecko
                                           |-- future Stripe/OpenAI/workflows/analytics
```

Use a reverse proxy or hosting rewrite so the browser continues to use relative `/api/v1` URLs. This avoids CORS and cookie-domain churn while still allowing separate deployments and scaling. The backend should also have an internal direct URL for service checks and testing.

## Ownership rules

### Frontend owns

- Routing, rendering, accessibility, metadata, and user interaction.
- Browser state and server-state query caching.
- Public configuration explicitly safe for browser exposure.
- Authentication UI and a typed Better Auth browser client; OAuth protocol handling remains backend-owned.
- Presentation-specific transformations and static marketing content.
- A generated or typed API client; no direct database/provider SDK calls.

### Backend owns

- Business use cases and authorization decisions.
- Database transactions and all MongoDB driver imports.
- Service-role credentials and third-party secret keys.
- External provider adapters, timeouts, retries, caching, and quota protection.
- Input/output validation, consistent errors, rate limiting, audit writes, and idempotency.
- Health/readiness endpoints, structured telemetry, and background jobs.
- Newsletter subscription triggered after verified authentication, with explicit consent/source rules.

### Shared packages own

- `api-contracts`: transport schemas, response types, error vocabulary, and API-client generation inputs.
- `auth`: permission names and pure authorization types; runtime verification remains backend-only.
- `db`: MongoDB connection management, application collection validators, index definitions, and versioned migration scripts for backend consumption only. Better Auth owns its documented auth collections through its MongoDB adapter.
- `ui`: reusable visual components used by frontend applications only.
- `config`: build, lint, and test presets without runtime secrets.

Shared packages must not contain business orchestration merely to avoid duplication. The frontend may consume contract types but must not import backend module implementations.

## Backend module structure

Start with these modules:

```text
modules/
  newsletter/
    domain/             # subscription rules and consent/source semantics
    application/        # subscribe use case and ports
    infrastructure/     # MongoDB repository
    http/               # route adapter and schemas
  market-data/
    application/        # market query use cases
    infrastructure/     # CoinGecko adapter and cache
    http/
  identity/
    application/        # current actor, user profile, and authorization context
    infrastructure/     # Better Auth configuration and MongoDB adapter
    http/               # /api/auth/* handler and current-session adapter
  organizations/        # introduced only when product work activates it
  platform/
    health/             # liveness/readiness
    audit/              # append-only sensitive-operation records
```

Dependencies point inward: HTTP and infrastructure adapters depend on application contracts; application logic must not depend on Fastify, the MongoDB driver, Next.js, Better Auth, or Supabase SDK types.

## API design

- Base path: `/api/v1`.
- JSON uses a documented naming convention consistently.
- Every request parameter is schema-validated.
- Every success response has a declared schema.
- Errors use the shared envelope: `{ code, message, details?, requestId }`.
- Do not expose raw provider or database messages.
- Cursor pagination is the default for growing collections.
- Mutating endpoints document idempotency behavior.
- OpenAPI is generated in CI and compatibility-checked.

Initial endpoints:

| Method and path | Purpose | Authentication |
|---|---|---|
| `POST /api/v1/newsletter/subscriptions` | Idempotently subscribe a contact | Public, rate limited |
| `GET /api/v1/markets` | Return market and global crypto data | Public, cached, rate limited |
| `GET /health/live` | Process liveness only | Infrastructure |
| `GET /health/ready` | Required dependency readiness | Infrastructure-restricted details |
| `GET /api/v1/me` | Validated identity/request-context smoke test | Required |

Preserve compatibility aliases for `/api/newsletter` and `/api/crypto` at the proxy layer during migration. Remove them only after frontend consumers and observability show no use.

## Authentication and authorization

Use Better Auth as a library inside the backend, not a third-party hosted identity service and not custom password/session cryptography.

1. The browser calls same-origin `/api/auth/*`; the edge proxy forwards those requests to `apps/api`.
2. Better Auth handles Google OAuth and any enabled credential flows, writing users, accounts, sessions, and verification records to MongoDB.
3. The backend issues signed, HTTP-only, secure session cookies. Keep cookies host-only unless a reviewed deployment requirement proves cross-subdomain cookies are necessary.
4. Protected routes resolve the session server-side and build an application-owned current-actor context; domain code never consumes Better Auth session types directly.
5. Application services resolve active organization membership and enforce explicit permissions.
6. Sensitive mutations write an audit record in the same transaction where feasible.

Configure an explicit auth base URL, exact trusted origins, secret rotation, secure-cookie behavior, rate limiting, and proxy trust. Keep authentication routes same-origin to avoid third-party-cookie failures. Google remains an OAuth provider, but Supabase no longer brokers it.

Authentication answers who the actor is. Authorization remains a backend domain decision. Frontend route guards are user experience only and never a security boundary.

## Data architecture

- MongoDB becomes the source of truth only after migration verification and cutover; PostgreSQL/Supabase remains authoritative before that gate.
- Use the official MongoDB Node.js driver initially. Do not introduce an ODM until a measured need justifies its abstraction and behavior.
- Only the backend receives the MongoDB connection string, database name, Better Auth secret, OAuth client secrets, or temporary privileged Supabase migration credentials.
- Repositories hide BSON and driver types from application modules and define session/transaction boundaries.
- Use a managed replica set in every non-test production-like environment; multi-document transactions and change streams require replica-set capabilities.
- Apply MongoDB JSON Schema validation to durable collections and Zod validation at application boundaries. Neither replaces the other.
- Manage indexes and data transformations with versioned, idempotent migration scripts executed as release jobs.
- Every tenant-owned document carries `organizationId`; every tenant query is scoped by it, and compound indexes begin with `organizationId` where access patterns require it.
- MongoDB has no PostgreSQL-style RLS. Tenant isolation must be enforced by repository APIs, authorization policy, least-privilege database users, and negative integration tests.
- Schema changes follow expand/migrate/contract so frontend and backend versions can overlap safely.

### Initial collection model

Use separate collections where records grow independently, are queried directly, or require their own uniqueness/lifecycle:

| Collection | Modeling direction | Essential indexes |
|---|---|---|
| Better Auth user/account/session/verification collections | Authentication identities, linked providers, revocable sessions, and verification state owned by Better Auth | Install and verify the indexes required by the selected Better Auth version |
| `userProfiles` | Application-owned profile and platform-role data keyed by Better Auth user ID | Unique auth user ID; normalized email only if an application use case requires it |
| `organizations` | Tenant profile and billing references | Unique slug; unique sparse external organization identity |
| `memberships` | Separate many-to-many edge, not an unbounded embedded array | Unique `(organizationId, userId)`; user lookup; tenant/role lookup |
| `organizationInvitations` | Independent expiry/status lifecycle | Unique token hash; tenant/email; TTL index only if automatic deletion matches audit requirements |
| `auditLogs` | Append-only events | `(organizationId, createdAt)` and entity lookup; retention/archival index if approved |
| `newsletterSubscribers` | Public subscription record | Unique normalized email; created time/source indexes |

Prefer references for memberships, invitations, and audit logs because they can grow without bound. Embed only small data that is always read and updated with its parent. Store deliberate snapshots such as audit display values when historical accuracy requires them.

### Consistency and identifiers

- Decide whether public/domain IDs remain strings/UUIDs or migrate to `ObjectId`; do not leak BSON identifiers into API contracts by accident.
- Enforce uniqueness with indexes, not check-then-insert logic.
- Use atomic single-document updates where possible and sessions/transactions for invariants spanning collections.
- Design retryable writes and idempotency for transaction retries and ambiguous network outcomes.
- Define read/write concern for each critical workflow; majority durability is the default proposal for identity, membership, invitation, audit, and newsletter writes.

## Market-data caching

Keep provider-specific types inside the CoinGecko adapter and return LegaBit-owned contract types. Begin with an in-process or platform cache only if one backend instance is expected; use a shared cache when horizontal scaling makes cache consistency/quota protection necessary. Define TTL, stale-on-error behavior, request coalescing, timeouts, and quota monitoring before cutover.

## Frontend data access

Create one API-client boundary used by client components, server components, and stores. Prefer TanStack Query for remote server state and reserve Zustand for durable local UI state. This prevents duplicate polling/caching logic and gives authentication, request IDs, errors, and retries one implementation point.

## Future extraction criteria

Extract a backend module into a separate service only when at least one is demonstrated:

- It needs a materially different scaling or reliability profile.
- It has independent ownership and release cadence.
- It requires a different runtime or data technology.
- Its failures must be isolated from the main API.

Stable application ports and API/events—not internal database tables—become the extraction seam.
