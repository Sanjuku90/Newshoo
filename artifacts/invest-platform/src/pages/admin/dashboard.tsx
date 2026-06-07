import { useEffect, useState } from "react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, BarChart2, UserPlus, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

interface ChartData {
  labels: string[];
  deposits: number[];
  withdrawals: number[];
  newUsers: number[];
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const W = data.length * 14;
  return (
    <svg className="w-full h-10" viewBox={`0 0 ${W} 40`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const h = Math.max(3, Math.round((v / max) * 36));
        return <rect key={i} x={i * 14 + 2} y={40 - h} width={10} height={h} rx={2} fill={color} opacity={v === 0 ? 0.2 : 0.75} />;
      })}
    </svg>
  );
}

function ChartCard({ title, data, labels, color, format }: {
  title: string; data: number[]; labels: string[]; color: string; format?: (v: number) => string;
}) {
  const fmt = format ?? ((v: number) => v.toFixed(0));
  const total = data.reduce((a, b) => a + b, 0);
  const today = data[data.length - 1] ?? 0;
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{title}</span>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className={`text-xl font-bold`} style={{ color }}>{fmt(total)}</div>
            <div className="text-xs text-muted-foreground">7 derniers jours</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">{fmt(today)}</div>
            <div className="text-xs text-muted-foreground">aujourd'hui</div>
          </div>
        </div>
        <MiniBarChart data={data} color={color} />
        <div className="flex justify-between mt-1">
          {labels.filter((_, i) => i % 2 === 0).map((l, i) => (
            <span key={i} className="text-[9px] text-muted-foreground">{l}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();
  const { token } = useAuth() as any;
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/chart-data", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setChartData(d); setChartLoading(false); })
      .catch(() => setChartLoading(false));
  }, [token]);

  if (isLoading) {
    return <div className="space-y-6"><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />)}</div></div>;
  }

  const s = stats as any;

  const statCards = [
    { label: "Utilisateurs", value: s?.totalUsers || 0, icon: Users, href: "/admin/users", color: "text-primary" },
    { label: "Investissements actifs", value: s?.activeInvestments || 0, icon: TrendingUp, href: "/admin/investments", color: "text-teal-400" },
    { label: "Total déposé", value: `${parseFloat(s?.totalDeposited || "0").toFixed(0)} USDT`, icon: ArrowDownToLine, href: "/admin/deposits", color: "text-emerald-400" },
    { label: "Total retiré", value: `${parseFloat(s?.totalWithdrawn || "0").toFixed(0)} USDT`, icon: ArrowUpFromLine, href: "/admin/withdrawals", color: "text-blue-400" },
    { label: "Dépôts en attente", value: s?.pendingDeposits || 0, icon: Wallet, href: "/admin/deposits", color: "text-amber-400" },
    { label: "Retraits en attente", value: s?.pendingWithdrawals || 0, icon: ArrowUpFromLine, href: "/admin/withdrawals", color: "text-orange-400" },
    { label: "KYC en attente", value: s?.pendingKyc || 0, icon: ShieldCheck, href: "/admin/kyc", color: "text-purple-400" },
    { label: "Tickets ouverts", value: s?.openTickets || 0, icon: AlertCircle, href: "/admin/tickets", color: "text-red-400" },
    { label: "Nouveaux aujourd'hui", value: s?.newUsersToday || 0, icon: UserPlus, href: "/admin/users", color: "text-cyan-400" },
  ];

  const emptyChart = { labels: ["","","","","","",""], deposits: [0,0,0,0,0,0,0], withdrawals: [0,0,0,0,0,0,0], newUsers: [0,0,0,0,0,0,0] };
  const cd = chartData ?? emptyChart;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Tableau de bord Admin</h1>
        <p className="text-muted-foreground text-sm">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="border-border hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts — 7 days */}
      <div>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" /> Activité — 7 derniers jours
        </h2>
        {chartLoading ? (
          <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-36" />)}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <ChartCard
              title="Dépôts approuvés"
              data={cd.deposits}
              labels={cd.labels}
              color="#10b981"
              format={v => `${v.toFixed(0)} USDT`}
            />
            <ChartCard
              title="Retraits approuvés"
              data={cd.withdrawals}
              labels={cd.labels}
              color="#60a5fa"
              format={v => `${v.toFixed(0)} USDT`}
            />
            <ChartCard
              title="Nouveaux utilisateurs"
              data={cd.newUsers}
              labels={cd.labels}
              color="#a78bfa"
              format={v => `${v.toFixed(0)}`}
            />
          </div>
        )}
      </div>

      {s?.recentActivity && s.recentActivity.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s.recentActivity.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="text-sm">{item.description}</div>
                  <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("fr-FR")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
