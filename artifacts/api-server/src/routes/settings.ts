import { Router } from "express";
import { requireAdmin } from "../middlewares/authenticate";
import { getSettings, upsertSetting, invalidateSettingsCache, SETTINGS_DEFAULTS } from "../lib/settings";
import { logAdminAction } from "../lib/admin-log";

const router = Router();

// Public — returns only non-sensitive settings needed by the frontend
const PUBLIC_KEYS = ["deposit_wallet", "min_deposit", "min_withdrawal", "withdrawal_fee_rate", "platform_name", "support_email", "support_telegram", "maintenance_mode"];

router.get("/settings/public", async (_req, res) => {
  const all = await getSettings();
  const pub: Record<string, string> = {};
  for (const key of PUBLIC_KEYS) pub[key] = all[key] ?? SETTINGS_DEFAULTS[key] ?? "";
  res.json(pub);
});

// Admin — full read
router.get("/admin/settings", requireAdmin, async (_req, res) => {
  const all = await getSettings();
  res.json(all);
});

// Admin — update one or many keys
router.patch("/admin/settings", requireAdmin, async (req, res) => {
  const updates = req.body as Record<string, string>;
  if (!updates || typeof updates !== "object") {
    res.status(400).json({ error: "Body must be a key-value object" });
    return;
  }
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value !== "string") continue;
    await upsertSetting(key, value);
  }
  invalidateSettingsCache();
  await logAdminAction(req, "update_settings", "settings", 0, JSON.stringify(updates));
  const all = await getSettings();
  res.json(all);
});

export default router;
