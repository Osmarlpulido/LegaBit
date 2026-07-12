# LegaBit API

Independent TypeScript backend for LegaBit. It owns authentication, markets, newsletter persistence, and health routes.

## Configuration

The runtime reads configuration from process environment variables. Required values:

- `MONGODB_URI`: MongoDB replica-set connection string.
- `MONGODB_MIGRATION_URI`: separate schema-management connection used only by migrations.
- `MONGODB_DATABASE`: database name; defaults to `legabit`.
- `BETTER_AUTH_SECRET`: required signing secret of at least 32 characters.
- `BETTER_AUTH_URL`: public frontend origin used for same-origin auth routes; defaults to `http://localhost:3000`.
- `AUTH_TRUSTED_ORIGINS`: comma-separated exact frontend origins; defaults to `http://localhost:3000`.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: optional during foundation development, but both are required to enable Google login.

Optional server values are `API_HOST` (default `0.0.0.0`), `API_PORT` (default `4000`), `LOG_LEVEL`, and `NODE_ENV`.

Do not commit real connection strings. Production configuration must be injected by the hosting platform.

For local development, the repository root [`compose.yaml`](../../compose.yaml)
provides a persistent single-node MongoDB replica set. Start and initialize it,
then apply migrations before running the API:

```bash
docker compose up -d mongodb mongodb-init
docker compose ps -a
MONGODB_MIGRATION_URI='mongodb://localhost:27017/?replicaSet=rs0' \
MONGODB_DATABASE='legabit' \
yarn workspace @legabit/backend migrate
MONGODB_URI='mongodb://localhost:27017/?replicaSet=rs0' \
MONGODB_DATABASE='legabit' \
BETTER_AUTH_SECRET='replace-with-at-least-32-random-characters' \
yarn workspace @legabit/backend dev
```

Use `docker compose down` to stop MongoDB without deleting data. The local
Compose service binds only to `127.0.0.1` and intentionally has no credentials;
it is not a production deployment template. Its replica-set member advertises
`localhost:27017`, so it supports host-run clients only. Do not use
`mongodb:27017` from another container with this profile; create a deployment
whose advertised member hostname is resolvable by every intended client.

## Commands

```bash
yarn workspace @legabit/api-contracts build
yarn workspace @legabit/backend dev
yarn workspace @legabit/backend typecheck
yarn workspace @legabit/backend test
yarn workspace @legabit/backend build
yarn workspace @legabit/backend migrate
yarn openapi:generate
yarn openapi:check
yarn openapi:compat --base-ref origin/main
```

Backend tests run without MongoDB by default and report the real-database suite
as skipped. To require that suite locally, start the Compose replica set and run:

```bash
MONGODB_INTEGRATION_URI='mongodb://localhost:27017/?replicaSet=rs0' \
yarn workspace @legabit/backend test
```

CI always supplies `MONGODB_INTEGRATION_URI` from a MongoDB 7 replica-set
service. Replica-set initialization is a required step, so the backend job fails
instead of silently skipping the real-Mongo integration and concurrency tests.

Run `migrate` once for each environment before starting or deploying an API version that serves newsletter subscriptions. The versioned command idempotently installs the collection validator, unique index, and migration history; it is deliberately separate from API startup so the runtime MongoDB principal only needs data read/write privileges. Run migrations with a schema-management principal, then run the API with its more restricted runtime principal.

## API contracts and compatibility

Zod schemas in `@legabit/api-contracts` are canonical. HTTP routes attach JSON Schema derived from those contracts so Fastify validates and serializes responses from the same definitions used to generate `openapi/openapi.json`.

Run `yarn openapi:generate` after changing a documented route or contract. The backend build runs `openapi:check` and fails when the committed artifact differs from the generated document.

Run `yarn openapi:compat --base-ref <git-ref>` to compare the committed artifact with a supported baseline. CI uses the pull request base commit (or the previous `main` commit) and rejects removed paths, operations, parameters, response shapes, media types, enum values, and newly required inputs. Additive changes remain valid.

Within `/api/v1`, changes are additive when existing request fields remain valid and existing response fields retain their meaning and type. Removing or renaming fields, making optional inputs required, narrowing accepted values, or changing status/error semantics is breaking and requires a new API version or an explicitly documented compatibility window.

## Health endpoints

- `GET /health/live` reports whether the API process is running and does not query dependencies.
- `GET /health/ready` pings MongoDB and returns `503` when the API should not receive traffic.
- `GET|POST /api/auth/*` is the self-hosted Better Auth handler.
- `GET /api/v1/me` returns the current application-facing user or HTTP `401`.

## Current boundary

Only `apps/api/src/infrastructure` may use the MongoDB driver. HTTP adapters depend on application-facing interfaces, and future domain/application modules must remain independent of Fastify and MongoDB types.
