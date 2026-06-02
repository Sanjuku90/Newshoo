import { useEffect, useState } from "react";
import { useGetDashboardSummary, useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, Users, Clock, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

function InvestmentCard({ inv }: { inv: any }) {
  const totalDays = inv.durationDays || 15;
  const daysLeft = inv.daysLeft ?? 0;
  const daysElapsed = totalDays - daysLeft;
  const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

  return (
    <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{inv.planName}</div>
          <div className="text-xs text-muted-foreground">{inv.amount} USDT · {inv.dailyRate}%/jour</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-accent">+{parseFloat(inv.totalEarned || 0).toFixed(2)} USDT</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            {daysLeft > 0 ? `${daysLeft}j restants` : "Terminé"}
          </div>
        </div>
      </div>
      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Jour {daysElapsed}/{totalDays}</span>
        <span>{Math.round(progress)}% complété</span>
      </div>
    </div>
  );
}

function AnnouncementBanner({ text, type }: { text: string; type: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (!text || dismissed) return null;

  const config = {
    info: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", icon: Info },
    warning: { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400", icon: AlertTriangle },
    success: { bg: "bg-green-500/10 border-green-500/30", text: "text-green-400", icon: CheckCircle2 },
  }[type] || { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", icon: Info };

  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 ${config.bg}`}>
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${config.text}`} />
      <p className={`text-sm flex-1 ${config.text}`}>{text}</p>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground text-xs shrink-0">✕</button>
    </div>
  );
}

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboardSummary();
  const { data: transactions } = useListTransactions({ limit: 5 });
  const [announcement, setAnnouncement] = useState<{ text: string; type: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings/public")
      .then(r => r.json())
      .then(s => {
        if (s.announcement_active === "1" && s.announcement_text) {
          setAnnouncement({ text: s.announcement_text, type: s.announcement_type || "info" });
        }
      })
      .catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const d = dashboard as any;

  const statCards = [
    { label: "Solde principal", value: `${parseFloat(d?.mainBalance || "0").toFixed(2)} USDT`, icon: Wallet, color: "text-primary" },
    { label: "Investi", value: `${parseFloat(d?.investedBalance || "0").toFixed(2)} USDT`, icon: TrendingUp, color: "text-accent" },
    { label: "Gains totaux", value: `${parseFloat(d?.totalEarnings || "0").toFixed(2)} USDT`, icon: ArrowDownToLine, color: "text-green-400" },
    { label: "Gains/jour", value: `${parseFloat(d?.dailyEarnings || "0").toFixed(2)} USDT`, icon: Clock, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Vue d'ensemble de vos investissements</p>
      </div>

      {announcement && <AnnouncementBanner text={announcement.text} type={announcement.type} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/deposit"><Button variant="outline" className="w-full gap-2"><ArrowDownToLine className="h-4 w-4" /> Dépôt</Button></Link>
        <Link href="/withdraw"><Button variant="outline" className="w-full gap-2"><ArrowUpFromLine className="h-4 w-4" /> Retrait</Button></Link>
        <Link href="/investments"><Button variant="outline" className="w-full gap-2"><TrendingUp className="h-4 w-4" /> Investir</Button></Link>
        <Link href="/referrals"><Button variant="outline" className="w-full gap-2"><Users className="h-4 w-4" /> Parrains</Button></Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Investissements actifs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d?.activeInvestments && d.activeInvestments.length > 0 ? (
              d.activeInvestments.map((inv: any) => <InvestmentCard key={inv.id} inv={inv} />)
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Aucun investissement actif.{" "}
                <Link href="/investments" className="text-primary hover:underline">Commencer à investir</Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Transactions récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(transactions as any)?.items && (transactions as any).items.length > 0 ? (
              (transactions as any).items.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium capitalize">{tx.type.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <div className={`text-sm font-semibold ${parseFloat(tx.amount) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {parseFloat(tx.amount) >= 0 ? "+" : ""}{tx.amount} USDT
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">Aucune transaction récente</div>
            )}
          </CardContent>
        </Card>
      </div>

      {d?.referral && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Réseau de parrainage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[1, 2, 3].map(l => (
                <div key={l}>
                  <div className="text-xl font-bold text-primary">{d.referral[`level${l}Count`] || 0}</div>
                  <div className="text-xs text-muted-foreground">Niveau {l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border text-center">
              <span className="text-muted-foreground text-sm">Total commissions : </span>
              <span className="font-semibold text-accent">{d.referral.totalCommissions || "0"} USDT</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
