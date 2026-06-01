---
name: Turso/LibSQL migration decisions
description: Key decisions from the PostgreSQL → Turso/LibSQL migration for InvestPro.
---

## Schema type mappings (pgTable → sqliteTable)
- `serial().primaryKey()` → `integer().primaryKey({ autoIncrement: true })`
- `numeric(...)` → `text()` (preserves decimal precision as string; app code uses `parseFloat()`)
- `timestamp()` → `integer({ mode: "timestamp" })` (stores Unix seconds, Drizzle returns `Date` objects)
- `boolean()` → `integer({ mode: "boolean" })` (TypeScript type `boolean`)
- `jsonb().$type<string[]>()` → `text().notNull().default("[]")` (must `JSON.stringify` on insert, `JSON.parse` on read in application code)

**Why:** SQLite does not have native boolean/timestamp/numeric types. Drizzle's `integer({ mode })` wrappers make TypeScript types compatible with existing application code.

## esbuild externals (build.mjs)
`@libsql/client`, `@libsql/*`, and `libsql` MUST be in the esbuild `external` list. They contain native binaries that cannot be bundled.

**Why:** esbuild tries to bundle `@libsql/client` but it dynamically loads `@libsql/linux-x64-gnu` (a native .node wrapper). The `"*.node"` catch-all is insufficient because it handles file references but not the package-level require.

## Direct dependency required
`@libsql/client` must also be a direct dependency of `@workspace/api-server` (not just `@workspace/db`).

**Why:** pnpm strict mode only makes packages accessible from packages that declare them directly. When esbuild externalizes the import, the bundled file at `artifacts/api-server/dist/` needs to resolve `@libsql/client` at runtime from its own node_modules tree.

## TURSO_DATABASE_URL format
- Local Replit dev: `file:/home/runner/workspace/lib/db/local.db` (absolute path required — pnpm runs packages from their own directory, so relative `file:./local.db` resolves to different paths in different packages)
- Production Render: `libsql://your-db.turso.io` + `TURSO_AUTH_TOKEN`

**Why:** `drizzle-kit push` (run from `lib/db`) creates the SQLite file relative to `lib/db`'s CWD, but the API server runs from `artifacts/api-server`. An absolute path ensures both tools use the same database file.

## Auto-seed on startup
Admin account and 3 plans are created by `lib/db/src/seed.ts`, called from `artifacts/api-server/src/index.ts` at startup (non-fatal if it fails). The seed is idempotent — it only inserts if no admin/plans exist.

## Admin credentials
- Email: `admin@investpro.com`
- Password: `1289`
- Hash: SHA256(`investpro_salt_2024` + password)

## Render deployment (render.yaml)
Single web service — Express serves both the API at `/api` and the built Vite static files for all other routes. This avoids CORS configuration entirely.
Build command builds Vite frontend first, then API server.
Required env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET` (auto-generated).
