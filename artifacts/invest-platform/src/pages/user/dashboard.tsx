import { useGetDashboardSummary, useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, Users, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboardSummary();
  const { data: transactions } = useListTransactions({ limit: 5 });

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
    { label: "Main Balance", value: `${parseFloat(d?.mainBalance || "0").toFixed(2)} USDT`, icon: Wallet, color: "text-primary" },
    { label: "Invested", value: `${parseFloat(d?.investedBalance || "0").toFixed(2)} USDT`, icon: TrendingUp, color: "text-accent" },
    { label: "Total Earnings", value: `${parseFloat(d?.totalEarnings || "0").toFixed(2)} USDT`, icon: ArrowDownToLine, color: "text-green-400" },
    { label: "Daily Earnings", value: `${parseFloat(d?.dailyEarnings || "0").toFixed(2)} USDT`, icon: Clock, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your investment overview</p>
      </div>

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
        <Link href="/deposit">
          <Button variant="outline" className="w-full gap-2">
            <ArrowDownToLine className="h-4 w-4" /> Deposit
          </Button>
        </Link>
        <Link href="/withdraw">
          <Button variant="outline" className="w-full gap-2">
            <ArrowUpFromLine className="h-4 w-4" /> Withdraw
          </Button>
        </Link>
        <Link href="/investments">
          <Button variant="outline" className="w-full gap-2">
            <TrendingUp className="h-4 w-4" /> Invest
          </Button>
        </Link>
        <Link href="/referrals">
          <Button variant="outline" className="w-full gap-2">
            <Users className="h-4 w-4" /> Referrals
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Active Investments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d?.activeInvestments && d.activeInvestments.length > 0 ? (
              d.activeInvestments.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{inv.planName}</div>
                    <div className="text-xs text-muted-foreground">{inv.amount} USDT · {inv.dailyRate}%/day</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-accent">+{inv.totalEarned} USDT</div>
                    <div className="text-xs text-muted-foreground">{inv.daysLeft}d left</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No active investments.{" "}
                <Link href="/investments" className="text-primary hover:underline">Start investing</Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(transactions as any)?.items && (transactions as any).items.length > 0 ? (
              (transactions as any).items.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium capitalize">{tx.type.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className={`text-sm font-semibold ${parseFloat(tx.amount) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {parseFloat(tx.amount) >= 0 ? "+" : ""}{tx.amount} USDT
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">No recent transactions</div>
            )}
          </CardContent>
        </Card>
      </div>

      {d?.referral && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Referral Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary">{d.referral.level1Count || 0}</div>
                <div className="text-xs text-muted-foreground">Level 1 (5%)</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{d.referral.level2Count || 0}</div>
                <div className="text-xs text-muted-foreground">Level 2 (3%)</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{d.referral.level3Count || 0}</div>
                <div className="text-xs text-muted-foreground">Level 3 (1%)</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border text-center">
              <span className="text-muted-foreground text-sm">Total commissions: </span>
              <span className="font-semibold text-accent">{d.referral.totalCommissions || "0"} USDT</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
