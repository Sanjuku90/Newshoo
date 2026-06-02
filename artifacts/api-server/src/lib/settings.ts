import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const DEFAULTS: Record<string, string> = {
  deposit_wallet: "TAB1oeEKDS5NATwFAaUrTioDU9djX7anyS",
  min_deposit: "69",
  min_withdrawal: "9",
  withdrawal_fee_rate: "2",
  platform_name: "InvestPro",
  support_email: "support@investpro.com",
  support_telegram: "",
  maintenance_mode: "0",
  referral_l1_rate: "5",
  referral_l2_rate: "3",
  referral_l3_rate: "1",
};

let cache: Record<string, string> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000;

export async function getSettings(): Promise<Record<string, string>> {
  if (cache && Date.now() < cacheExpiry) return cache;
  const rows = await db.select().from(settingsTable);
  const result: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) result[row.key] = row.value;
  cache = result;
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return result;
}

export async function getSetting(key: string): Promise<string> {
  const all = await getSettings();
  return all[key] ?? DEFAULTS[key] ?? "";
}

export function invalidateSettingsCache() {
  cache = null;
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(settingsTable).set({ value, updatedAt: new Date() }).where(eq(settingsTable.key, key));
  } else {
    await db.insert(settingsTable).values({ key, value, updatedAt: new Date() });
  }
  invalidateSettingsCache();
}

export { DEFAULTS as SETTINGS_DEFAULTS };
