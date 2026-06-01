import { useState } from "react";
import { useListDeposits, useCreateDeposit } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Copy, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WALLET_ADDRESS = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

const statusConfig: Record<string, { label: string; icon: any; class: string }> = {
  pending: { label: "Pending", icon: Clock, class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved: { label: "Approved", icon: CheckCircle2, class: "bg-accent/20 text-accent border-accent/30" },
  rejected: { label: "Rejected", icon: XCircle, class: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function Deposit() {
  const { data: deposits, isLoading, refetch } = useListDeposits();
  const createDeposit = useCreateDeposit();
  const { toast } = useToast();

  const [form, setForm] = useState({ amount: "", txHash: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createDeposit.mutate(
      { data: { amount: form.amount, txHash: form.txHash } },
      {
        onSuccess: () => {
          toast({ title: "Deposit submitted!", description: "Your deposit is pending verification." });
          setForm({ amount: "", txHash: "" });
          refetch();
        },
        onError: (err: any) => {
          setError(err?.data?.error || "Failed to submit deposit");
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Deposit</h1>
        <p className="text-muted-foreground text-sm">Send USDT TRC20 to the address below and submit your transaction</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Step 1: Send USDT TRC20</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Deposit Wallet Address</div>
              <div className="font-mono text-sm break-all text-foreground mb-3">{WALLET_ADDRESS}</div>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                {copied ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Address"}
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-yellow-400" />
                <span>Send <strong className="text-foreground">USDT on TRC20 network only</strong>. Other networks will result in lost funds.</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Minimum deposit: <strong className="text-foreground">69 USDT</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Step 2: Submit Transaction</CardTitle>
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
                  min="69"
                  step="0.01"
                  placeholder="Minimum 69 USDT"
                  value={form.amount}
                  onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Transaction Hash (TxID)</Label>
                <Input
                  placeholder="Enter the TRC20 transaction ID"
                  value={form.txHash}
                  onChange={e => setForm(prev => ({ ...prev, txHash: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">Find the TxID in your wallet after sending</p>
              </div>
              <Button type="submit" className="w-full" disabled={createDeposit.isPending}>
                {createDeposit.isPending ? "Submitting..." : "Submit Deposit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Deposit History</h2>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : deposits && (deposits as any[]).length > 0 ? (
          <div className="space-y-3">
            {(deposits as any[]).map((dep) => {
              const conf = statusConfig[dep.status] || statusConfig.pending;
              const Icon = conf.icon;
              return (
                <Card key={dep.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dep.amount} USDT</span>
                        <Badge className={`text-xs border ${conf.class}`}><Icon className="h-3 w-3 mr-1" />{conf.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate max-w-xs">{dep.txHash}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(dep.createdAt).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="py-12 text-center text-muted-foreground">No deposits yet</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
