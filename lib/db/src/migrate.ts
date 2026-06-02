import { db } from "./index";
import { sql } from "drizzle-orm";

async function addColumnIfMissing(table: string, column: string, definition: string) {
  try {
    await db.run(sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`));
    console.log(`[migrate] Added column ${table}.${column}`);
  } catch (e: any) {
    const msg: string = (e?.message ?? "") + (e?.cause?.message ?? "");
    if (!msg.includes("duplicate column")) throw e;
  }
}

async function createTableIfMissing(ddl: string, name: string) {
  try {
    await db.run(sql.raw(ddl));
    console.log(`[migrate] Ensured table: ${name}`);
  } catch (e: any) {
    if (!e?.message?.includes("already exists")) throw e;
  }
}

export async function runMigrations() {
  console.log("[migrate] Running schema migrations...");

  // ── Core tables (CREATE TABLE IF NOT EXISTS handles fresh DBs) ─────────────

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS users (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name       TEXT    NOT NULL DEFAULT '',
      last_name        TEXT    NOT NULL DEFAULT '',
      email            TEXT    NOT NULL DEFAULT '',
      phone            TEXT    NOT NULL DEFAULT '',
      country          TEXT    NOT NULL DEFAULT '',
      city             TEXT,
      password_hash    TEXT    NOT NULL DEFAULT '',
      role             TEXT    NOT NULL DEFAULT 'user',
      status           TEXT    NOT NULL DEFAULT 'active',
      kyc_level        INTEGER NOT NULL DEFAULT 0,
      kyc_status       TEXT    NOT NULL DEFAULT 'none',
      vip_level        INTEGER NOT NULL DEFAULT 0,
      referral_code    TEXT,
      referred_by_id   INTEGER,
      wallet_address   TEXT,
      main_balance     TEXT    NOT NULL DEFAULT '0',
      invested_balance TEXT    NOT NULL DEFAULT '0',
      total_earnings   TEXT    NOT NULL DEFAULT '0',
      bonus_balance    TEXT    NOT NULL DEFAULT '0',
      total_deposited  TEXT    NOT NULL DEFAULT '0',
      total_withdrawn  TEXT    NOT NULL DEFAULT '0',
      daily_earnings   TEXT    NOT NULL DEFAULT '0',
      total_invested   TEXT    NOT NULL DEFAULT '0',
      last_login_at    INTEGER,
      created_at       INTEGER,
      updated_at       INTEGER
    )`,
    "users"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS plans (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      description   TEXT,
      min_deposit   TEXT    NOT NULL,
      max_deposit   TEXT,
      daily_rate    TEXT    NOT NULL,
      duration_days INTEGER NOT NULL,
      is_active     INTEGER NOT NULL DEFAULT 1,
      features      TEXT    NOT NULL DEFAULT '[]',
      created_at    INTEGER,
      updated_at    INTEGER
    )`,
    "plans"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS investments (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL,
      plan_id        INTEGER NOT NULL,
      amount         TEXT    NOT NULL,
      daily_rate     TEXT    NOT NULL,
      duration_days  INTEGER NOT NULL,
      start_date     INTEGER NOT NULL DEFAULT (unixepoch()),
      end_date       INTEGER NOT NULL,
      status         TEXT    NOT NULL DEFAULT 'active',
      total_earned   TEXT    NOT NULL DEFAULT '0',
      last_profit_at INTEGER,
      created_at     INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "investments"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS deposits (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL,
      amount           TEXT    NOT NULL,
      status           TEXT    NOT NULL DEFAULT 'pending',
      wallet_address   TEXT    NOT NULL DEFAULT '',
      tx_hash          TEXT,
      rejection_reason TEXT,
      approved_at      INTEGER,
      created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "deposits"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS withdrawals (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL,
      amount           TEXT    NOT NULL,
      fee              TEXT    NOT NULL DEFAULT '0',
      net_amount       TEXT    NOT NULL,
      status           TEXT    NOT NULL DEFAULT 'pending',
      wallet_address   TEXT    NOT NULL,
      rejection_reason TEXT,
      processed_at     INTEGER,
      created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "withdrawals"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS transactions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      type         TEXT    NOT NULL,
      amount       TEXT    NOT NULL,
      status       TEXT    NOT NULL DEFAULT 'completed',
      description  TEXT,
      reference_id INTEGER,
      created_at   INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "transactions"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS commissions (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL,
      from_user_id   INTEGER NOT NULL,
      investment_id  INTEGER,
      level          INTEGER NOT NULL,
      amount         TEXT    NOT NULL,
      status         TEXT    NOT NULL DEFAULT 'completed',
      created_at     INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "commissions"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS kyc_documents (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL,
      document_type    TEXT    NOT NULL,
      document_data    TEXT,
      file_url         TEXT,
      status           TEXT    NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      reviewed_at      INTEGER,
      submitted_at     INTEGER NOT NULL DEFAULT (unixepoch()),
      created_at       INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "kyc_documents"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS tickets (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      subject       TEXT    NOT NULL,
      category      TEXT    NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'open',
      created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
      last_reply_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "tickets"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS ticket_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id  INTEGER NOT NULL,
      user_id    INTEGER,
      message    TEXT    NOT NULL,
      is_admin   TEXT    NOT NULL DEFAULT 'false',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "ticket_messages"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS promo_codes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      code        TEXT    NOT NULL UNIQUE,
      type        TEXT    NOT NULL DEFAULT 'fixed',
      value       TEXT    NOT NULL,
      max_uses    INTEGER,
      used_count  INTEGER NOT NULL DEFAULT 0,
      is_active   INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      expires_at  INTEGER,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "promo_codes"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS promo_code_usages (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      promo_code_id INTEGER NOT NULL,
      user_id       INTEGER NOT NULL,
      created_at    INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "promo_code_usages"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS admin_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id    INTEGER NOT NULL,
      action      TEXT    NOT NULL,
      target_type TEXT,
      target_id   INTEGER,
      details     TEXT,
      ip_address  TEXT,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    "admin_logs"
  );

  await createTableIfMissing(
    `CREATE TABLE IF NOT EXISTS settings (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      key        TEXT    NOT NULL UNIQUE,
      value      TEXT    NOT NULL,
      updated_at INTEGER
    )`,
    "settings"
  );

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

  // ── Patch missing columns on EXISTING tables (for old DBs that predate these columns) ──

  // users
  await addColumnIfMissing("users", "first_name",       "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "last_name",        "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "email",            "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "phone",            "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "country",          "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("users", "city",             "TEXT");
  await addColumnIfMissing("users", "birth_date",       "TEXT");
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

  // plans
  await addColumnIfMissing("plans", "description",   "TEXT");
  await addColumnIfMissing("plans", "max_deposit",   "TEXT");
  await addColumnIfMissing("plans", "is_active",     "INTEGER NOT NULL DEFAULT 1");
  await addColumnIfMissing("plans", "features",      "TEXT NOT NULL DEFAULT '[]'");
  await addColumnIfMissing("plans", "created_at",    "INTEGER");
  await addColumnIfMissing("plans", "updated_at",    "INTEGER");

  // investments
  await addColumnIfMissing("investments", "total_earned",   "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("investments", "last_profit_at", "INTEGER");
  await addColumnIfMissing("investments", "status",         "TEXT NOT NULL DEFAULT 'active'");

  // deposits
  await addColumnIfMissing("deposits", "wallet_address",   "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing("deposits", "tx_hash",          "TEXT");
  await addColumnIfMissing("deposits", "rejection_reason", "TEXT");
  await addColumnIfMissing("deposits", "approved_at",      "INTEGER");
  await addColumnIfMissing("deposits", "updated_at",       "INTEGER NOT NULL DEFAULT (unixepoch())");

  // withdrawals
  await addColumnIfMissing("withdrawals", "fee",              "TEXT NOT NULL DEFAULT '0'");
  await addColumnIfMissing("withdrawals", "rejection_reason", "TEXT");
  await addColumnIfMissing("withdrawals", "processed_at",     "INTEGER");
  await addColumnIfMissing("withdrawals", "updated_at",       "INTEGER NOT NULL DEFAULT (unixepoch())");

  // tickets
  await addColumnIfMissing("tickets", "last_reply_at", "INTEGER NOT NULL DEFAULT (unixepoch())");
  await addColumnIfMissing("tickets", "updated_at",    "INTEGER NOT NULL DEFAULT (unixepoch())");

  // promo_codes
  await addColumnIfMissing("promo_codes", "type",        "TEXT NOT NULL DEFAULT 'fixed'");
  await addColumnIfMissing("promo_codes", "max_uses",    "INTEGER");
  await addColumnIfMissing("promo_codes", "used_count",  "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing("promo_codes", "is_active",   "INTEGER NOT NULL DEFAULT 1");
  await addColumnIfMissing("promo_codes", "description", "TEXT");
  await addColumnIfMissing("promo_codes", "expires_at",  "INTEGER");

  console.log("[migrate] Migrations complete.");
}
