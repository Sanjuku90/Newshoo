import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, Play, TrendingUp, AlertCircle, CheckCircle2, Calendar, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCron() {
  const { token } = useAuth() as any;
  const { toast } = useToast();
  const [lastRun, setLastRun] = useState<string | null>(null);

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ["admin-cron-status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/cron/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    refetchInterval: 30000,
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/cron/run-profits", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: (data) => {
      setLastRun(new Date().toISOString());
      toast({ title: "✅ Profits crédités !", description: data.message });
      refetch();
    },
    onError: (e: any) => {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    },
  });

  const s = status as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Cron — Profits journaliers</h1>
            <p className="text-muted-foreground text-sm">Crédit automatique chaque jour à 00:01</p>
          </div>
        </div>
        <Button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="gap-2"
        >
          {runMutation.isPending ? (
            <><span className="animate-spin">⏳</span> En cours...</>
          ) : (
            <><Play className="h-4 w-4" /> Lancer maintenant</>
          )}
        </Button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-1">Investissements actifs</div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-primary">{s?.activeInvestments ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-1">Paiement journalier total</div>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold text-accent">{(s?.totalDailyPayout ?? 0).toFixed(2)} <span className="text-sm">USDT</span></div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-1">Expirent dans ≤ 3 jours</div>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <div className={`text-2xl font-bold ${(s?.expiringSoon ?? 0) > 0 ? "text-yellow-400" : "text-foreground"}`}>
                {s?.expiringSoon ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground mb-1">Statut cron</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-green-400">Actif</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />Planification</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fréquence</span>
              <span className="font-medium">Tous les jours à 00:01</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dernière exécution</span>
              <span className="font-medium">
                {lastRun || s?.lastRunAt
                  ? new Date(lastRun || s.lastRunAt).toLocaleString("fr-FR")
                  : <span className="text-muted-foreground">Aucune</span>}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prochaine exécution</span>
              <span className="font-medium">
                {s?.nextRunAt
                  ? new Date(s.nextRunAt).toLocaleString("fr-FR")
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" />Ce que fait le cron</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { icon: CheckCircle2, color: "text-green-400", text: "Calcule le profit journalier de chaque investissement actif" },
                { icon: CheckCircle2, color: "text-green-400", text: "Crédite le montant sur le solde principal de l'utilisateur" },
                { icon: CheckCircle2, color: "text-green-400", text: "Enregistre chaque transaction dans l'historique" },
                { icon: CheckCircle2, color: "text-green-400", text: "Met à jour totalEarned sur l'investissement" },
                { icon: AlertCircle, color: "text-yellow-400", text: "Marque les investissements expirés et rembourse le capital" },
              ].map(({ icon: Icon, color, text }) => (
                <li key={text} className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                  {text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Manual run warning */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Déclenchement manuel</span> — Le bouton "Lancer maintenant" crédite les profits immédiatement sur tous les investissements actifs. À utiliser avec précaution pour éviter un double-crédit le même jour. Chaque exécution est journalisée dans l'audit admin.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
