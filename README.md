# LegaBit

LegaBit is being migrated into two independently deployable applications inside a Yarn/Turbo monorepo:

- **Frontend:** `apps/web` — Next.js 15 and React 19.
- **Backend:** `apps/api` — Fastify, TypeScript, and MongoDB.

The frontend serves the user interface while the backend owns authentication, newsletter persistence, market data, and health endpoints.

## Requirements

### Shared requirements

- Node.js 20 or newer.
- Yarn Classic 1.22.x. The repository declares `yarn@1.22.22`.
- Git.
- A Unix-like shell for the command examples, or equivalent environment-variable syntax on Windows.

Check the installed versions:

```bash
node --version
yarn --version
```

### Backend requirements

- MongoDB 7-compatible deployment.
- Replica-set support. Use a managed MongoDB replica set in hosted environments; the local Docker instructions below create a single-node development replica set.
- The following environment variables:
  - `MONGODB_URI` — required MongoDB connection string.
  - `MONGODB_MIGRATION_URI` — schema-management connection used only by the migration command.
  - `MONGODB_DATABASE` — optional; defaults to `legabit`.
  - `API_HOST` — optional; defaults to `0.0.0.0`.
  - `API_PORT` — optional; defaults to `4000`.
  - `LOG_LEVEL` — optional; defaults to `info`.
  - `NODE_ENV` — optional; defaults to `development`.
  - `BETTER_AUTH_SECRET` — required; at least 32 characters and stored as a secret.
  - `BETTER_AUTH_URL` — public frontend origin used for same-origin auth routes; defaults to `http://localhost:3000`.
  - `AUTH_TRUSTED_ORIGINS` — comma-separated exact frontend origins; defaults to `http://localhost:3000`.
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — configure both to enable the replacement Google login.

### Frontend requirements

Create `apps/web/.env.local` for local frontend configuration. Use [.env.example](./.env.example) as the reference.

The frontend may also use:

- `COINGECKO_API_KEY` for higher CoinGecko limits.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` for WalletConnect.
- The optional marketing URL variables listed in `.env.example`.

Better Auth and newsletter persistence are backend-owned in `apps/api`; `apps/web` has no Supabase or database runtime dependency.

## Install dependencies

From the repository root:

```bash
yarn install
```

## Start MongoDB locally

The Compose setup starts MongoDB 7, persists development data in a named volume,
and idempotently initializes a single-node `rs0` replica set:

```bash
docker compose up -d mongodb mongodb-init
```

The initializer exits successfully once initialization is complete. Wait for
MongoDB to become healthy before running migrations or the API:

```bash
docker compose ps -a
```

`mongodb` should report `healthy` and `mongodb-init` should report an exit code of
`0`. Initialization is safe to run again. MongoDB is bound only to
`127.0.0.1:27017` and this local setup intentionally has no credentials; do not
use it as a hosted-environment configuration.

Apply the backend's idempotent MongoDB migrations before starting the API:

```bash
MONGODB_MIGRATION_URI='mongodb://localhost:27017/?replicaSet=rs0' \
MONGODB_DATABASE='legabit' \
yarn workspace @legabit/backend migrate
```

## Build shared API contracts

Build the shared schemas before starting the backend or running the frontend directly:

```bash
yarn workspace @legabit/api-contracts build
```

## Start the backend

The backend reads configuration from the process environment. From the repository root:

```bash
MONGODB_URI='mongodb://localhost:27017/?replicaSet=rs0' \
MONGODB_DATABASE='legabit' \
API_PORT=4000 \
BETTER_AUTH_SECRET='replace-with-at-least-32-random-characters' \
yarn workspace @legabit/backend dev
```

The API is available at `http://localhost:4000`.

Verify process liveness:

```bash
curl -i http://localhost:4000/health/live
```

Expected body:

```json
{"status":"ok"}
```

Verify MongoDB readiness:

```bash
curl -i http://localhost:4000/health/ready
```

Expected body:

```json
{"status":"ready","dependencies":{"mongodb":"up"}}
```

Readiness returns HTTP `503` if MongoDB is unavailable. Liveness remains HTTP `200` as long as the API process is running.

## Start the frontend

In a second terminal, from the repository root:

```bash
yarn workspace web dev
```

Open `http://localhost:3000`.

The frontend calls the versioned backend routes through same-origin `/api/v1/*` rewrites, so the backend must be running for dashboard and newsletter features.

## Start both applications

Use two terminals during the migration.

Terminal 1 — backend:

```bash
MONGODB_URI='mongodb://localhost:27017/?replicaSet=rs0' \
MONGODB_DATABASE='legabit' \
BETTER_AUTH_SECRET='replace-with-at-least-32-random-characters' \
yarn workspace @legabit/backend dev
```

Terminal 2 — frontend:

```bash
yarn workspace web dev
```

The root `yarn dev` command uses Turbo, but separate workspace commands make each runtime and its logs easier to diagnose while the architecture is being split.

## Verification commands

### Backend and contracts

```bash
yarn workspace @legabit/api-contracts typecheck
yarn workspace @legabit/api-contracts build
yarn workspace @legabit/backend typecheck
yarn workspace @legabit/backend build
yarn workspace @legabit/backend test
```

### Frontend

```bash
yarn workspace web typecheck
yarn workspace web build
```

With MongoDB, the migrated API, and the frontend running, verify the rendered
newsletter form and same-origin submission path:

```bash
yarn workspace web journey:newsletter
```

## Stop local services

Stop the development servers with `Ctrl+C`. Stop local MongoDB with:

```bash
docker compose down
```

Local data remains in the `legabit_mongodb-data` Compose volume. To deliberately
delete that data and recreate an empty database, run `docker compose down -v`.

## Architecture roadmap

The current migration plan, progress, decisions, and workstreams are documented in [feature/backend-frontend-refactor/README.md](./feature/backend-frontend-refactor/README.md).
