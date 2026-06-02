import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Megaphone, AlertTriangle, RefreshCw } from "lucide-react";
import { useUpdateAdminSettings } from "@workspace/api-client-react";

const API_BASE = "/api";

export default function AdminBroadcast() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", targetGroup: "all", minBalance: "" });
  const [result, setResult] = useState<{ sent: number } | null>(null);

  // Announcement state
  const [announcement, setAnnouncement] = useState({ text: "", type: "info", active: false });
  const [savingAnn, setSavingAnn] = useState(false);

  const handleBroadcast = async () => {
    if (!form.title || !form.message) {
      toast({ title: "Erreur", description: "Titre et message requis", variant: "destructive" });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ ...form, minBalance: form.minBalance || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      toast({ title: `Message envoyé à ${data.sent} utilisateur(s) !` });
      setForm({ title: "", message: "", targetGroup: "all", minBalance: "" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    setSavingAnn(true);
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          announcement_text: announcement.text,
          announcement_type: announcement.type,
          announcement_active: announcement.active ? "1" : "0",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: announcement.active ? "Annonce publiée !" : "Annonce désactivée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setSavingAnn(false);
    }
  };

  const targetLabels: Record<string, string> = {
    all: "Tous les utilisateurs",
    active: "Utilisateurs actifs uniquement",
    min_balance: "Solde minimum (USDT)",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Messagerie & Annonces</h1>
        <p className="text-muted-foreground text-sm">Envoyez des notifications ciblées ou affichez une bannière sur le dashboard des utilisateurs.</p>
      </div>

      {/* Announcement banner */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Bannière d'annonce</CardTitle>
          </div>
          <CardDescription>Affiche un message en haut du dashboard de tous les utilisateurs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/40 rounded-lg">
            {["info", "warning", "success"].map(t => (
              <button key={t} onClick={() => setAnnouncement(a => ({ ...a, type: t }))}
                className={`py-1.5 rounded-md text-xs font-medium transition-colors ${announcement.type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t === "info" ? "ℹ️ Info" : t === "warning" ? "⚠️ Avertissement" : "✅ Succès"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Texte de l'annonce</Label>
            <Input
              value={announcement.text}
              onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))}
              placeholder="Ex : Maintenance prévue samedi 02h-04h UTC..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAnnouncement(a => ({ ...a, active: !a.active }))}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${announcement.active ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {announcement.active ? "✅ Activée" : "Désactivée"}
            </button>
            <Button onClick={handleSaveAnnouncement} disabled={savingAnn} className="flex-1 gap-2">
              {savingAnn ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
              Publier l'annonce
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Broadcast */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Message push (notification)</CardTitle>
          </div>
          <CardDescription>Envoie une notification dans la cloche de chaque utilisateur ciblé.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex : Nouvelle offre spéciale !" />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <textarea
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Contenu du message..."
            />
          </div>

          <div className="space-y-2">
            <Label>Destinataires</Label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/40 rounded-lg">
              {Object.entries(targetLabels).map(([val, label]) => (
                <button key={val} onClick={() => setForm(f => ({ ...f, targetGroup: val }))}
                  className={`py-1.5 rounded-md text-xs font-medium transition-colors text-center ${form.targetGroup === val ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.targetGroup === "min_balance" && (
            <div className="space-y-2">
              <Label>Solde minimum (USDT)</Label>
              <Input type="number" min="0" step="1" value={form.minBalance} onChange={e => setForm(f => ({ ...f, minBalance: e.target.value }))} placeholder="Ex : 100" />
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 text-sm text-accent bg-accent/10 border border-accent/30 rounded-lg px-3 py-2">
              <Users className="h-4 w-4 shrink-0" />
              Message envoyé à <strong>{result.sent}</strong> utilisateur(s)
            </div>
          )}

          <Button onClick={handleBroadcast} disabled={sending} className="w-full gap-2">
            {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Envoyer le message
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">Les notifications push sont visibles dans la cloche (🔔) du menu utilisateur. Les annonces s'affichent en bannière sur le dashboard. Ces actions sont enregistrées dans le journal admin.</p>
        </CardContent>
      </Card>
    </div>
  );
}
