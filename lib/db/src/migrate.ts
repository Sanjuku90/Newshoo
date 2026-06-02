import { db } from "./index";
import { sql } from "drizzle-orm";

async function addColumnIfMissing(table: string, column: string, definition: string) {
  try {
    await db.run(sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`));
    console.log(`[migrate] Added column ${table}.${column}`);
  } catch (e: any) {
    if (!e?.message?.includes("duplicate column") && !e?.cause?.message?.includes("duplicate column")) {
      throw e;
    }
  }
}

async function createTableIfMissing(ddl: string, name: string) {
  try {
    await db.run(sql.raw(ddl));
    console.log(`[migrate] Ensured table: ${name}`);
  } catch (e: any) {
    if (!e?.message?.includes("already exists")) {
      throw e;
    }
  }
}

export async function runMigrations() {
  console.log("[migrate] Running schema migrations...");

  // ── users table: ensure ALL schema columns exist (safe to run repeatedly) ──
  await addColumnIfMissing("users", "city",             "TEXT");
  await addColumnIfMissing("users", "wallet_address",   "TEXT");
  await addColumnIfMissing("users", "last_login_at",    "INTEGER");
  await addColumnIfMissing("users", "invested_balance", "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "total_earnings",   "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "bonus_balance",    "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "total_deposited",  "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "total_withdrawn",  "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "daily_earnings",   "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "total_invested",   "TEXT NOT NULL DEFAULT '0'");

  // ── notifications table ───────────────────────────────────────────────────
  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      type       TEXT    NOT NULL,
      title      TEXT    NOT NULL,
      message    TEXT    NOT NULL,
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER
    )`,
    "notifications"
  );

  // ── leader_bonuses table (added during feature work) ─────────────────────
  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS leader_bonuses (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      milestone  INTEGER NOT NULL,
      amount     TEXT    NOT NULL,
      status     TEXT    NOT NULL DEFAULT 'awarded',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "leader_bonuses"
  );

  // ── promo_code_usages table ───────────────────────────────────────────────
  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS promo_code_usages (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      promo_code_id INTEGER NOT NULL,
      user_id       INTEGER NOT NULL,
      created_at    INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "promo_code_usages"
  );

  console.log("[migrate] Migrations complete.");
}
