import { useListInvestments } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const statusConfig: Record<string, string> = {
  active: "bg-accent/20 text-accent border-accent/30",
  completed: "bg-secondary text-muted-foreground border-border",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function AdminInvestments() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListInvestments();

  const items = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Investments</h1>
        <p className="text-muted-foreground text-sm">View all platform investments</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <Card className="border-border"><CardContent className="py-12 text-center text-muted-foreground">No investments yet</CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 pr-4">Plan</th>
                <th className="text-left py-3 pr-4">Amount</th>
                <th className="text-left py-3 pr-4">Earned</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3">Dates</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv: any) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="py-3 pr-4">{inv.planName} <span className="text-xs text-muted-foreground">({inv.dailyRate}%/day)</span></td>
                  <td className="py-3 pr-4 font-semibold">{inv.amount} USDT</td>
                  <td className="py-3 pr-4 text-accent">+{parseFloat(inv.totalEarned || "0").toFixed(2)} USDT</td>
                  <td className="py-3 pr-4">
                    <Badge className={`text-xs border ${statusConfig[inv.status] || statusConfig.active}`}>{inv.status}</Badge>
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {new Date(inv.startDate).toLocaleDateString()} → {new Date(inv.endDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
