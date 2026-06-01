import { useState } from "react";
import { useListAdminDeposits, useApproveDeposit, useRejectDeposit } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved: { label: "Approved", class: "bg-accent/20 text-accent border-accent/30" },
  rejected: { label: "Rejected", class: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function AdminDeposits() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [reason, setReason] = useState("");

  const { data, isLoading, refetch } = useListAdminDeposits({ status: statusFilter as any, page, limit: 20 } as any);
  const approve = useApproveDeposit();
  const reject = useRejectDeposit();
  const { toast } = useToast();

  const handleApprove = (dep: any) => {
    approve.mutate(
      { id: dep.id },
      {
        onSuccess: () => { toast({ title: "Deposit approved!" }); refetch(); },
        onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
      }
    );
  };

  const handleReject = () => {
    reject.mutate(
      { id: rejectTarget.id, data: { reason } },
      {
        onSuccess: () => { toast({ title: "Deposit rejected" }); setRejectTarget(null); setReason(""); refetch(); },
        onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
      }
    );
  };

  const items = Array.isArray(data) ? data : ((data as any)?.deposits || []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Deposits</h1>
        <p className="text-muted-foreground text-sm">Review and approve user deposits</p>
      </div>

      <div className="flex gap-2">
        {["pending", "approved", "rejected"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }} className="capitalize">{s}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <Card className="border-border"><CardContent className="py-12 text-center text-muted-foreground">No {statusFilter} deposits</CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 pr-4">User</th>
                <th className="text-left py-3 pr-4">Amount</th>
                <th className="text-left py-3 pr-4">TxHash</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3 pr-4">Date</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((dep: any) => {
                const conf = statusConfig[dep.status] || statusConfig.pending;
                return (
                  <tr key={dep.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-3 pr-4">{dep.userFirstName} {dep.userLastName}<br /><span className="text-xs text-muted-foreground">{dep.userEmail}</span></td>
                    <td className="py-3 pr-4 font-semibold">{dep.amount} USDT</td>
                    <td className="py-3 pr-4">
                      <a href={`https://tronscan.org/#/transaction/${dep.txHash}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline text-xs">
                        {dep.txHash?.slice(0, 12)}... <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={`text-xs border ${conf.class}`}>{conf.label}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{new Date(dep.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      {dep.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1 text-accent border-accent/30 hover:bg-accent/10" onClick={() => handleApprove(dep)}>
                            <CheckCircle2 className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setRejectTarget(dep); setReason(""); }}>
                            <XCircle className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={open => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Reject Deposit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Rejecting {rejectTarget?.amount} USDT deposit from {rejectTarget?.userFirstName} {rejectTarget?.userLastName}</p>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea placeholder="Reason for rejection..." value={reason} onChange={e => setReason(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectTarget(null)} className="flex-1">Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={reject.isPending} className="flex-1">Reject Deposit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
