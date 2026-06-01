import { useState } from "react";
import { useListPlans, useListInvestments, useCreateInvestment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Investments() {
  const { data: plans, isLoading: plansLoading } = useListPlans();
  const { data: investments, isLoading: invLoading, refetch } = useListInvestments();
  const createInvestment = useCreateInvestment();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleInvest = () => {
    if (!selectedPlan) return;
    setError("");
    createInvestment.mutate(
      { data: { planId: selectedPlan.id, amount: amount as any } },
      {
        onSuccess: () => {
          toast({ title: "Investment created!", description: `You invested ${amount} USDT in ${selectedPlan.name}` });
          setSelectedPlan(null);
          setAmount("");
          refetch();
        },
        onError: (err: any) => {
          setError(err?.data?.error || "Failed to create investment");
        },
      }
    );
  };

  const statusColor: Record<string, string> = {
    active: "bg-accent/20 text-accent border-accent/30",
    completed: "bg-secondary text-muted-foreground border-border",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Investments</h1>
        <p className="text-muted-foreground text-sm">Choose a plan and start earning daily returns</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        {plansLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {(plans || []).map((plan, i) => {
              const features: string[] = Array.isArray(plan.features)
                ? plan.features as string[]
                : JSON.parse((plan.features as unknown as string) || "[]");
              return (
                <Card key={plan.id} className={`border-border cursor-pointer transition-all hover:border-primary/50 ${i === 1 ? 'border-primary/30' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      {i === 1 && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Popular</Badge>}
                    </div>
                    <CardDescription>
                      <span className="text-2xl font-bold text-primary">{plan.dailyRate}%</span>
                      <span className="text-muted-foreground text-sm"> / day</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      {plan.minDeposit}–{plan.maxDeposit || "∞"} USDT · {plan.durationDays} days
                    </div>
                    <ul className="space-y-1.5">
                      {features.slice(0, 3).map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-accent shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" size="sm" onClick={() => { setSelectedPlan(plan); setAmount(String(plan.minDeposit)); setError(""); }}>
                      Invest Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">My Investments</h2>
        {invLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        ) : investments && (investments as any[]).length > 0 ? (
          <div className="space-y-3">
            {(investments as any[]).map((inv) => (
              <Card key={inv.id} className="border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-medium">{inv.planName}</span>
                      <Badge className={`text-xs border ${statusColor[inv.status] || statusColor.completed}`}>{inv.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {inv.amount} USDT · {inv.dailyRate}%/day · Started {new Date(inv.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-accent">+{parseFloat(inv.totalEarned || "0").toFixed(2)} USDT</div>
                    <div className="text-xs text-muted-foreground">{inv.daysLeft || 0}d remaining</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              No investments yet. Choose a plan above to get started.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={open => { if (!open) setSelectedPlan(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Invest in {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              {selectedPlan?.dailyRate}% daily for {selectedPlan?.durationDays} days · Min: {selectedPlan?.minDeposit} USDT
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Amount (USDT)</Label>
              <Input
                type="number"
                min={selectedPlan?.minDeposit}
                max={selectedPlan?.maxDeposit || undefined}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Min: ${selectedPlan?.minDeposit} USDT`}
              />
            </div>
            {amount && (
              <div className="bg-secondary/50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily return</span>
                  <span className="text-accent font-medium">+{(parseFloat(amount || "0") * parseFloat(selectedPlan?.dailyRate || "0") / 100).toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total return</span>
                  <span className="text-accent font-medium">+{(parseFloat(amount || "0") * parseFloat(selectedPlan?.dailyRate || "0") * (selectedPlan?.durationDays || 30) / 100).toFixed(2)} USDT</span>
                </div>
              </div>
            )}
            <Button className="w-full" onClick={handleInvest} disabled={createInvestment.isPending || !amount}>
              {createInvestment.isPending ? "Processing..." : "Confirm Investment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
