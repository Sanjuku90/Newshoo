import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;

if (!url) {
  throw new Error(
    "TURSO_DATABASE_URL must be set. Use 'file:./local.db' for local dev or 'libsql://...' for Turso.",
  );
}

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export * from "./schema";
