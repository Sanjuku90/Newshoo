import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Settings, Mail, MessageCircle, AlertTriangle, Users, ArrowUpFromLine, ArrowDownToLine, RefreshCw } from "lucide-react";

const API_BASE = "/api";

async function fetchSettings(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function patchSettings(updates: Record<string, string>): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings()
      .then(s => { setSettings(s); setLoading(false); })
      .catch(() => { toast({ title: "Erreur", description: "Impossible de charger les paramètres", variant: "destructive" }); setLoading(false); });
  }, []);

  const val = (key: string) => changed[key] ?? settings[key] ?? "";
  const set = (key: string, value: string) => setChanged(prev => ({ ...prev, [key]: value }));

  const save = async (keys?: string[]) => {
    const toSave = keys
      ? Object.fromEntries(keys.map(k => [k, val(k)]))
      : { ...settings, ...changed };
    setSaving(true);
    try {
      const updated = await patchSettings(toSave);
      setSettings(updated);
      setChanged({});
      toast({ title: "Paramètres sauvegardés !" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground" />
    </div>
  );

  const isDirty = Object.keys(changed).length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Paramètres de la plateforme</h1>
          <p className="text-muted-foreground text-sm">Configurez tous les aspects de la plateforme depuis cet espace.</p>
        </div>
        {isDirty && (
          <Button onClick={() => save()} disabled={saving} className="gap-2">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            Enregistrer tout
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Portefeuille de dépôt */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Adresse de dépôt USDT TRC20</CardTitle>
            </div>
            <CardDescription>L'adresse affichée aux utilisateurs pour envoyer leurs fonds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Adresse du portefeuille (TRC20)</Label>
              <Input
                className="font-mono"
                placeholder="TRC20 address (starts with T)"
                value={val("deposit_wallet")}
                onChange={e => set("deposit_wallet", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Commence toujours par « T ». Vérifiez deux fois avant de sauvegarder.</p>
            </div>
            <Button size="sm" onClick={() => save(["deposit_wallet"])} disabled={saving}>
              Sauvegarder l'adresse
            </Button>
          </CardContent>
        </Card>

        {/* Limites financières */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Limites de dépôt & retrait</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Dépôt minimum (USDT)</Label>
                <Input
                  type="number" min="1" step="1"
                  value={val("min_deposit")}
                  onChange={e => set("min_deposit", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Retrait minimum (USDT)</Label>
                <Input
                  type="number" min="1" step="1"
                  value={val("min_withdrawal")}
                  onChange={e => set("min_withdrawal", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Frais de retrait (%)</Label>
                <Input
                  type="number" min="0" max="50" step="0.1"
                  value={val("withdrawal_fee_rate")}
                  onChange={e => set("withdrawal_fee_rate", e.target.value)}
                />
              </div>
            </div>
            <Button size="sm" onClick={() => save(["min_deposit", "min_withdrawal", "withdrawal_fee_rate"])} disabled={saving}>
              Sauvegarder les limites
            </Button>
          </CardContent>
        </Card>

        {/* Parrainage */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Bonus de parrainage</CardTitle>
            </div>
            <CardDescription>Pourcentage du premier dépôt reversé au parrain selon le niveau.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Niveau 1 (%)</Label>
                <Input
                  type="number" min="0" max="50" step="0.1"
                  value={val("referral_l1_rate")}
                  onChange={e => set("referral_l1_rate", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Filleul direct</p>
              </div>
              <div className="space-y-2">
                <Label>Niveau 2 (%)</Label>
                <Input
                  type="number" min="0" max="50" step="0.1"
                  value={val("referral_l2_rate")}
                  onChange={e => set("referral_l2_rate", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Filleul du filleul</p>
              </div>
              <div className="space-y-2">
                <Label>Niveau 3 (%)</Label>
                <Input
                  type="number" min="0" max="50" step="0.1"
                  value={val("referral_l3_rate")}
                  onChange={e => set("referral_l3_rate", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">3e génération</p>
              </div>
            </div>
            <Button size="sm" onClick={() => save(["referral_l1_rate", "referral_l2_rate", "referral_l3_rate"])} disabled={saving}>
              Sauvegarder le parrainage
            </Button>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Contact & Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de la plateforme</Label>
                <Input
                  value={val("platform_name")}
                  onChange={e => set("platform_name", e.target.value)}
                  placeholder="InvestPro"
                />
              </div>
              <div className="space-y-2">
                <Label>Email de support</Label>
                <Input
                  type="email"
                  value={val("support_email")}
                  onChange={e => set("support_email", e.target.value)}
                  placeholder="support@investpro.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-400" />
                <Label>Lien Telegram (optionnel)</Label>
              </div>
              <Input
                value={val("support_telegram")}
                onChange={e => set("support_telegram", e.target.value)}
                placeholder="https://t.me/votre_canal"
              />
            </div>
            <Button size="sm" onClick={() => save(["platform_name", "support_email", "support_telegram"])} disabled={saving}>
              Sauvegarder le contact
            </Button>
          </CardContent>
        </Card>

        {/* Mode maintenance */}
        <Card className={`border-2 ${val("maintenance_mode") === "1" ? "border-yellow-500/50 bg-yellow-500/5" : "border-border"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${val("maintenance_mode") === "1" ? "text-yellow-400" : "text-muted-foreground"}`} />
              <CardTitle className="text-base">Mode maintenance</CardTitle>
            </div>
            <CardDescription>
              Quand activé, les utilisateurs voient un message de maintenance. L'espace admin reste accessible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => set("maintenance_mode", "0")}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  val("maintenance_mode") === "0"
                    ? "bg-accent/20 border-accent text-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                ✅ Site en ligne
              </button>
              <button
                onClick={() => set("maintenance_mode", "1")}
                className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  val("maintenance_mode") === "1"
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                🔧 Maintenance
              </button>
            </div>
            <Button size="sm" onClick={() => save(["maintenance_mode"])} disabled={saving}>
              Appliquer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
