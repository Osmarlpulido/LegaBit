# Decisions and open questions

Status: in progress
Last reviewed: 2026-07-12

Resolve `BLOCKING` items before implementing the phase that depends on them. Each decision should be recorded as an ADR rather than silently encoded in the first implementation pull request.

## Decision register

| ID | Decision | Recommendation | Status | Blocks |
|---|---|---|---|---|
| D-01 | Canonical identity system | Self-host Better Auth inside `apps/api` with its MongoDB adapter; retain Google as an OAuth provider and remove Supabase after staged cutover | Accepted direction; security/deployment details pending | Identity schema, protected API |
| D-02 | Backend runtime | Node.js/TypeScript with Fastify | Accepted and implemented | Backend scaffold |
| D-03 | API topology | Separate backend deployment behind same-origin `/api/v1` proxy | `BLOCKING` | Deployment, auth transport |
| D-04 | Persistence path | MongoDB with the official Node.js driver; retire Prisma/PostgreSQL and direct service-role PostgREST writes after verified migration | Accepted direction; design details `BLOCKING` | Backend data layer, newsletter extraction |
| D-05 | Contract source | Zod schemas in renamed `api-contracts`, with generated/verified OpenAPI | Partially implemented; OpenAPI pending | API foundation |
| D-06 | Backend shape | Modular monolith until extraction criteria are met | Accepted; foundation implemented | Module layout |
| D-07 | Remote frontend state | TanStack Query through one typed API client | Proposed | Frontend cleanup |
| D-08 | Market cache | Start platform/in-process; adopt shared cache based on scale/quota measurements | Open | Scale phase |
| D-09 | Tenant isolation | Repository-enforced organization scope, backend authorization, least-privilege MongoDB roles, and mandatory negative tests | Proposed | Organization launch |
| D-10 | Static content | Keep in frontend source during this refactor; evaluate CMS separately | Proposed | None |
| D-11 | MongoDB hosting/topology | Managed MongoDB replica set with point-in-time backups and monitoring | `BLOCKING` | Production data layer |
| D-12 | MongoDB modeling/IDs | Access-pattern-led references/embedding and deliberate string/UUID versus `ObjectId` policy | `BLOCKING` | Data migration, API contracts |
| D-13 | Migration cutover | Rehearsed bulk load plus delta synchronization/final write freeze and explicit post-cutover rollback policy | `BLOCKING` | MongoDB source-of-truth switch |

## D-01 outcome and remaining identity decisions

The active application authenticates with Supabase, while the Prisma schema names Clerk identifiers and `.env.example` describes both providers. The selected destination is Better Auth hosted in `apps/api`, backed by MongoDB. Neither Supabase nor Clerk remains in the target runtime.

Questions to answer:

- Will the first release support Google only, or Google plus email/password?
- Must existing Supabase accounts preserve their application identity, or is forced Google re-authentication acceptable?
- What session lifetime, idle refresh, concurrent-session, and revocation policies apply?
- Is MFA/passkey support required in the first auth release or a later hardening phase?
- Which exact production and preview origins are trusted?
- What secret rotation overlap and emergency global-session revocation procedure are required?

Application collections must reference the Better Auth user ID through an application-owned profile boundary rather than copying provider-specific Google identifiers. Do not attempt to import Supabase password hashes or sessions. Existing users either link through a verified migration flow or re-authenticate with Google, according to an approved policy.

## Why D-04 and its MongoDB design details are blocking

The newsletter currently prefers a service-role Supabase REST write and falls back to Prisma/PostgreSQL. MongoDB is now the selected target, but choosing the engine does not determine document boundaries, constraints, consistency, IDs, migration mechanics, or operational topology.

Questions to answer:

- Does the live `NewsletterSubscriber` table exactly match Prisma migration history?
- Did the manual SQL file create objects or policies not represented in migrations?
- Are there triggers, RLS policies, foreign-key behaviors, or integrations that must be reproduced or intentionally retired?
- Which data-retention and deletion rules apply to email and phone fields?
- Which collections use references versus embedding, based on real read/write patterns and growth bounds?
- Will domain IDs remain stable strings/UUIDs or map to `ObjectId`, and how are foreign references reconciled?
- Which workflows require multi-document transactions and majority read/write concerns?
- How will the migration capture writes occurring between bulk export and cutover?
- How will data written to MongoDB after cutover be preserved if rollback to PostgreSQL is required?

The direction is to make MongoDB through backend repositories the sole application persistence interface. Supabase may remain the authentication provider, but Supabase Postgres/PostgREST and Prisma leave the application runtime after migration verification and the agreed rollback window.

## Product and compliance questions

- Does Google login constitute newsletter consent, or must the user opt in separately?
- Is phone mandatory, and what business purpose/retention period applies?
- Which markets, currencies, and freshness guarantees does the dashboard promise?
- Which upcoming domain should shape the first protected backend use case: organizations, education, CRM, billing, or community?
- Are there geographic data residency or regulatory constraints?

## Platform questions

- Where are frontend, backend, current PostgreSQL, target MongoDB, and edge routing deployed today and in the target state?
- Is MongoDB Atlas or another managed deployment approved, and in which region/tier/topology?
- Can the platform canary route or weight traffic by path/header?
- What are provider quotas, expected request volume, and traffic peaks?
- Is a managed Redis-compatible cache already available?
- Which observability, error-reporting, and secret-management systems are standard?
- What are acceptable RTO and RPO values?

## Team and delivery questions

- Who owns frontend, backend, schema migrations, security review, and production incidents?
- How long must old frontend versions remain compatible with a new backend?
- What observation window is required before deleting compatibility routes?
- Are preview environments allowed to access isolated databases and auth tenants?
- What release cadence and approval process should the two deployables follow?

## ADR template

Use this minimal structure for every decision:

```markdown
# ADR-NNN: Decision title

Status: proposed | accepted | superseded
Date: YYYY-MM-DD
Owner: team/person

## Context
What forces and constraints require a decision?

## Decision
What is being chosen, including important boundaries?

## Alternatives considered
What credible options were rejected and why?

## Consequences
What becomes easier, harder, risky, or irreversible?

## Migration and rollback
How will the project adopt or reverse the decision safely?

## Review trigger
What evidence or date should cause reconsideration?
```

## Decision-complete gate

Phase 1 is in progress and D-01, D-02, D-05, and D-06 have accepted directions. Auth implementation additionally requires an accepted same-origin routing design, Better Auth security configuration, Google credential/callback ownership, and account-migration policy. MongoDB persistence work and route cutover require D-11 through D-13, approved collection/index/consistency designs, product confirmation of newsletter consent behavior, a live source-data inventory, and owner agreement on routing and rollback. Open scale choices such as Redis can remain deferred until measurements justify them.
