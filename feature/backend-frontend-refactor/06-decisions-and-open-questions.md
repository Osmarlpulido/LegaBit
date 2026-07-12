# Decisions and open questions

Status: in progress
Last reviewed: 2026-07-12

Resolve `BLOCKING` items before implementing the phase that depends on them. Each decision should be recorded as an ADR rather than silently encoded in the first implementation pull request.

## Decision register

| ID | Decision | Recommendation | Status | Blocks |
|---|---|---|---|---|
| D-01 | Canonical identity provider | Keep Supabase Auth because it is the active runtime; remove Clerk assumptions/config unless a near-term requirement justifies migration | `BLOCKING` | Identity schema, protected API |
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

## Why D-01 is blocking

The active application authenticates with Supabase, while the Prisma schema names Clerk identifiers and `.env.example` describes both providers. Building user synchronization or organization authorization before choosing one source of identity would create a second migration and ambiguous security semantics.

Questions to answer:

- Are any deployed users or organizations already represented in Clerk?
- Is Supabase Auth intended for the future organization model, or only the current marketing login?
- Which provider features are required: organizations, invitations, MFA, enterprise SSO, audit events?
- What account-linking and migration experience is acceptable?

If Supabase is selected, replace `clerkUserId`/`clerkOrganizationId` with provider-neutral external identity records instead of renaming them to another provider-specific column. If Clerk is selected, plan an explicit session and account migration; do not run both indefinitely without a federation design.

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

Phase 1 may start when D-01 through D-04 are accepted. MongoDB persistence work and route cutover additionally require D-11 through D-13, approved collection/index/consistency designs, product confirmation of newsletter consent behavior, a live source-data inventory, and owner agreement on routing and rollback. Open scale choices such as Redis can remain deferred until measurements justify them.
