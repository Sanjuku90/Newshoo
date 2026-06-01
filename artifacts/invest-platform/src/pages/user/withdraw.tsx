import { useState } from "react";
import { useListWithdrawals, useCreateWithdrawal, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; icon: any; class: string }> = {
  pending: { label: "Pending", icon: Clock, class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved: { label: "Approved", icon: CheckCircle2, class: "bg-accent/20 text-accent border-accent/30" },
  rejected: { label: "Rejected", icon: XCircle, class: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function Withdraw() {
  const { data: user } = useGetMe();
  const { data: withdrawals, isLoading, refetch } = useListWithdrawals();
  const createWithdrawal = useCreateWithdrawal();
  const { toast } = useToast();

  const [form, setForm] = useState({ amount: "", walletAddress: "" });
  const [error, setError] = useState("");

  const balance = parseFloat((user as any)?.mainBalance || "0");
  const requestedAmount = parseFloat(form.amount || "0");
  const fee = requestedAmount * 0.02;
  const netAmount = requestedAmount - fee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createWithdrawal.mutate(
      { data: { amount: form.amount, walletAddress: form.walletAddress } },
      {
        onSuccess: () => {
          toast({ title: "Withdrawal requested!", description: "Your request is pending admin approval." });
          setForm({ amount: "", walletAddress: "" });
          refetch();
        },
        onError: (err: any) => {
          setError(err?.data?.error || "Failed to submit withdrawal");
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Withdraw</h1>
        <p className="text-muted-foreground text-sm">Withdraw your earnings to your USDT TRC20 wallet</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Available Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-primary">{balance.toFixed(2)} USDT</div>
            <div className="space-y-2 text-sm bg-secondary/50 rounded-lg p-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Minimum withdrawal</span><span className="text-foreground font-medium">9 USDT</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Processing fee</span><span className="text-foreground font-medium">2%</span>
              </div>
              {form.amount && requestedAmount > 0 && (
                <>
                  <div className="border-t border-border pt-2 flex justify-between text-muted-foreground">
                    <span>Fee</span><span className="text-destructive font-medium">-{fee.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You receive</span><span className="text-accent">{netAmount.toFixed(2)} USDT</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-yellow-400" />
              Withdrawals are processed manually. Allow 1–24 hours for approval.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (USDT)</Label>
                <Input
                  type="number"
                  min="9"
                  max={balance}
                  step="0.01"
                  placeholder="Minimum 9 USDT"
                  value={form.amount}
                  onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Your USDT TRC20 Wallet Address</Label>
                <Input
                  placeholder="TRC20 address (starts with T)"
                  value={form.walletAddress}
                  onChange={e => setForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createWithdrawal.isPending || balance < 9}>
                {createWithdrawal.isPending ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Withdrawal History</h2>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : withdrawals && (withdrawals as any[]).length > 0 ? (
          <div className="space-y-3">
            {(withdrawals as any[]).map((w) => {
              const conf = statusConfig[w.status] || statusConfig.pending;
              const Icon = conf.icon;
              return (
                <Card key={w.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{w.amount} USDT</span>
                        <Badge className={`text-xs border ${conf.class}`}><Icon className="h-3 w-3 mr-1" />{conf.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate max-w-xs">{w.walletAddress}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="py-12 text-center text-muted-foreground">No withdrawals yet</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
