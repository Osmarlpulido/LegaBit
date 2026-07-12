# LegaBit

LegaBit is being migrated into two independently deployable applications inside a Yarn/Turbo monorepo:

- **Frontend:** `apps/web` — Next.js 15 and React 19.
- **Backend:** `apps/api` — Fastify, TypeScript, and MongoDB.

The migration is incremental. The frontend still serves the existing newsletter, crypto, authentication, and diagnostic routes through Next.js. The new backend currently provides its runtime foundation and health endpoints; it does not serve product traffic yet.

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
  - `MONGODB_DATABASE` — optional; defaults to `legabit`.
  - `API_HOST` — optional; defaults to `0.0.0.0`.
  - `API_PORT` — optional; defaults to `4000`.
  - `LOG_LEVEL` — optional; defaults to `info`.
  - `NODE_ENV` — optional; defaults to `development`.
  - `BETTER_AUTH_SECRET` — required; at least 32 characters and stored as a secret.
  - `BETTER_AUTH_URL` — public backend/auth origin; defaults to `http://localhost:4000`.
  - `AUTH_TRUSTED_ORIGINS` — comma-separated exact frontend origins; defaults to `http://localhost:3000`.
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — configure both to enable the replacement Google login.

### Frontend requirements

Create `apps/web/.env.local` for local frontend and legacy server-route configuration. Use [.env.example](./.env.example) as the reference.

The current frontend still requires Supabase authentication variables during the transition:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` may temporarily replace `SUPABASE_SECRET_KEY` for the existing newsletter route. Never expose either server credential with a `NEXT_PUBLIC_` prefix.

The current frontend may also use:

- `DATABASE_URL` and `DIRECT_URL` for its temporary Prisma/PostgreSQL fallback.
- `COINGECKO_API_KEY` for higher CoinGecko limits.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` for WalletConnect.
- The optional marketing URL variables listed in `.env.example`.

Prisma/PostgreSQL, Supabase Auth, and privileged Supabase data access are transitional frontend dependencies. Better Auth will be self-hosted in `apps/api` with MongoDB-backed sessions. Supabase packages and configuration will be removed only after authentication and data routes cut over successfully.

## Install dependencies

From the repository root:

```bash
yarn install
```

The current Prisma package downloads a platform-specific engine during installation. If that legacy download is blocked by local TLS or network configuration, you can install the new backend dependencies with lifecycle scripts disabled:

```bash
yarn install --ignore-scripts
```

That fallback is enough for backend development and tests. The legacy frontend's Prisma route may still require a successful client generation:

```bash
yarn workspace @legabit/db generate
```

## Start MongoDB locally

If MongoDB is not already available, Docker is the quickest local option:

```bash
docker run --rm -d \
  --name legabit-mongo \
  -p 27017:27017 \
  mongo:7 \
  --replSet rs0 \
  --bind_ip_all
```

Initialize the single-node replica set once after the container starts:

```bash
docker exec legabit-mongo \
  mongosh --quiet --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
```

Confirm it is ready:

```bash
docker exec legabit-mongo \
  mongosh --quiet --eval 'db.adminCommand({ ping: 1 })'
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

The frontend currently calls its own `/api/newsletter` and `/api/crypto` handlers. Running the new backend alongside it validates the separated runtime, but stopping the backend does not yet disable those existing frontend features.

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

The frontend checks require its transitional Prisma client and environment to be configured successfully.

## Stop local services

Stop the development servers with `Ctrl+C`. Stop the temporary MongoDB container with:

```bash
docker stop legabit-mongo
```

Because the container was created with `--rm` and no volume, its data is deleted when it stops. Add a Docker volume if persistent local data is required.

## Architecture roadmap

The current migration plan, progress, decisions, and workstreams are documented in [feature/backend-frontend-refactor/README.md](./feature/backend-frontend-refactor/README.md).
