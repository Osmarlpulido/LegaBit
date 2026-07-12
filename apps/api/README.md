# LegaBit API

Independent TypeScript backend for LegaBit. This foundation does not serve product traffic yet; the existing Next.js route handlers remain active during the migration.

## Configuration

The runtime reads configuration from process environment variables. Required values:

- `MONGODB_URI`: MongoDB replica-set connection string.
- `MONGODB_DATABASE`: database name; defaults to `legabit`.

Optional server values are `API_HOST` (default `0.0.0.0`), `API_PORT` (default `4000`), `LOG_LEVEL`, and `NODE_ENV`.

Do not commit real connection strings. Production configuration must be injected by the hosting platform.

## Commands

```bash
yarn workspace @legabit/api-contracts build
yarn workspace @legabit/backend dev
yarn workspace @legabit/backend typecheck
yarn workspace @legabit/backend test
yarn workspace @legabit/backend build
```

## Health endpoints

- `GET /health/live` reports whether the API process is running and does not query dependencies.
- `GET /health/ready` pings MongoDB and returns `503` when the API should not receive traffic.

## Current boundary

Only `apps/api/src/infrastructure` may use the MongoDB driver. HTTP adapters depend on application-facing interfaces, and future domain/application modules must remain independent of Fastify and MongoDB types.
