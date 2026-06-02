import { db } from "./index";
import { sql } from "drizzle-orm";

async function addColumnIfMissing(table: string, column: string, definition: string) {
  try {
    await db.run(sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`));
    console.log(`[migrate] Added column ${table}.${column}`);
  } catch (e: any) {
    const msg: string = e?.message ?? "";
    const causeMsg: string = e?.cause?.message ?? "";
    if (!msg.includes("duplicate column") && !causeMsg.includes("duplicate column")) {
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

  // ── users table: ensure EVERY schema column exists (safe to re-run) ────────
  // Core columns that may be absent on an old DB (added with safe defaults)
  await addColumnIfMissing("users", "first_name",       "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "last_name",        "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "email",            "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "phone",            "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "country",          "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "city",             "TEXT");
  await addColumnIfMissing("users", "password_hash",    "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "role",             "TEXT NOT NULL DEFAULT 'user'");
  await addColumnIfMissing("users", "status",           "TEXT NOT NULL DEFAULT 'active'");
  await addColumnIfMissing("users", "kyc_level",        "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing("users", "kyc_status",       "TEXT NOT NULL DEFAULT 'none'");
  await addColumnIfMissing("users", "vip_level",        "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing("users", "referral_code",    "TEXT");
  await addColumnIfMissing("users", "referred_by_id",   "INTEGER");
  await addColumnIfMissing("users", "wallet_address",   "TEXT");
  await addColumnIfMissing("users", "main_balance",     "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "invested_balance", "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "total_earnings",   "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "bonus_balance",    "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "total_deposited",  "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "total_withdrawn",  "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "daily_earnings",   "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "total_invested",   "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("users", "last_login_at",    "INTEGER");
  await addColumnIfMissing("users", "created_at",       "INTEGER");
  await addColumnIfMissing("users", "updated_at",       "INTEGER");

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

  // ── leader_bonuses table ──────────────────────────────────────────────────
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
