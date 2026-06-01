import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />)}</div>;
  }

  const s = stats as any;

  const cards = [
    { label: "Total Users", value: s?.totalUsers || 0, icon: Users, href: "/admin/users", color: "text-primary" },
    { label: "Active Investments", value: s?.activeInvestments || 0, icon: TrendingUp, href: "/admin/investments", color: "text-accent" },
    { label: "Total Deposited", value: `${parseFloat(s?.totalDeposited || "0").toFixed(2)} USDT`, icon: ArrowDownToLine, href: "/admin/deposits", color: "text-green-400" },
    { label: "Total Withdrawn", value: `${parseFloat(s?.totalWithdrawn || "0").toFixed(2)} USDT`, icon: ArrowUpFromLine, href: "/admin/withdrawals", color: "text-yellow-400" },
    { label: "Pending Deposits", value: s?.pendingDeposits || 0, icon: Wallet, href: "/admin/deposits", color: "text-orange-400" },
    { label: "Pending KYC", value: s?.pendingKyc || 0, icon: ShieldCheck, href: "/admin/kyc", color: "text-blue-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
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

      {/* Recent activity summary */}
      {s?.recentActivity && s.recentActivity.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {s.recentActivity.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="text-sm">{item.description}</div>
                  <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
