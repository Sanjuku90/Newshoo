import { useState } from "react";
import { useListAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; class: string }> = {
  pending:  { label: "En attente", class: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  approved: { label: "Approuvé",   class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  rejected: { label: "Rejeté",     class: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function AdminWithdrawals() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [bulkReason, setBulkReason] = useState("");

  const { data, isLoading, refetch } = useListAdminWithdrawals({ status: statusFilter as any, page, limit: 20 } as any);
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();
  const { toast } = useToast();

  const items = Array.isArray(data) ? data : ((data as any)?.withdrawals || []);
  const pendingItems = items.filter((w: any) => w.status === "pending");
  const allSelected = selected.size > 0 && selected.size === pendingItems.length;

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(pendingItems.map((w: any) => w.id)));
  };

  const bulkApprove = async () => {
    const ids = Array.from(selected);
    let count = 0;
    for (const id of ids) {
      await new Promise<void>(resolve => {
        approve.mutate({ id }, { onSettled: () => resolve() });
      });
      count++;
    }
    setSelected(new Set());
    toast({ title: `${count} retrait(s) approuvé(s)` });
    refetch();
  };

  const bulkReject = async () => {
    const ids = Array.from(selected);
    let count = 0;
    for (const id of ids) {
      await new Promise<void>(resolve => {
        reject.mutate({ id, data: { reason: bulkReason || "Rejeté en masse" } }, { onSettled: () => resolve() });
      });
      count++;
    }
    setSelected(new Set());
    setBulkRejecting(false);
    setBulkReason("");
    toast({ title: `${count} retrait(s) rejeté(s)` });
    refetch();
  };

  const handleApprove = (w: any) => {
    approve.mutate({ id: w.id }, {
      onSuccess: () => { toast({ title: "Retrait approuvé !" }); refetch(); },
      onError: (err: any) => toast({ title: "Erreur", description: err?.data?.error, variant: "destructive" }),
    });
  };

  const handleReject = () => {
    reject.mutate({ id: rejectTarget.id, data: { reason } }, {
      onSuccess: () => { toast({ title: "Retrait rejeté" }); setRejectTarget(null); setReason(""); refetch(); },
      onError: (err: any) => toast({ title: "Erreur", description: err?.data?.error, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Retraits</h1>
        <p className="text-muted-foreground text-sm">Traiter les demandes de retrait</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[
            { key: "pending", label: "En attente" },
            { key: "approved", label: "Approuvés" },
            { key: "rejected", label: "Rejetés" },
          ].map(s => (
            <Button key={s.key} variant={statusFilter === s.key ? "default" : "outline"} size="sm"
              onClick={() => { setStatusFilter(s.key); setPage(1); setSelected(new Set()); }}>
              {s.label}
            </Button>
          ))}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.size} sélectionné(s)</span>
            <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={bulkApprove} disabled={approve.isPending}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Tout approuver
            </Button>
            <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => setBulkRejecting(true)}>
              <XCircle className="h-3.5 w-3.5" /> Tout rejeter
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <Card className="border-border"><CardContent className="py-12 text-center text-muted-foreground">Aucun retrait {statusFilter === "pending" ? "en attente" : statusFilter === "approved" ? "approuvé" : "rejeté"}</CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                {statusFilter === "pending" && (
                  <th className="py-3 pr-3 w-8">
                    <button onClick={toggleAll} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${allSelected ? "bg-primary border-primary" : "border-border hover:border-primary"}`}>
                      {allSelected && <CheckSquare className="h-3 w-3 text-primary-foreground" />}
                    </button>
                  </th>
                )}
                <th className="text-left py-3 pr-4">Utilisateur</th>
                <th className="text-left py-3 pr-4">Montant</th>
                <th className="text-left py-3 pr-4">Frais / Net</th>
                <th className="text-left py-3 pr-4">Adresse</th>
                <th className="text-left py-3 pr-4">Statut</th>
                <th className="text-left py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w: any) => {
                const conf = statusConfig[w.status] || statusConfig.pending;
                const amount = parseFloat(w.amount || "0");
                const fee = amount * 0.02;
                const isSelected = selected.has(w.id);
                return (
                  <tr key={w.id} className={`border-b border-border/50 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                    {statusFilter === "pending" && (
                      <td className="py-3 pr-3">
                        <button onClick={() => toggleSelect(w.id)} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-border hover:border-primary"}`}>
                          {isSelected && <CheckSquare className="h-3 w-3 text-primary-foreground" />}
                        </button>
                      </td>
                    )}
                    <td className="py-3 pr-4">{w.userFirstName} {w.userLastName}<br /><span className="text-xs text-muted-foreground">{w.userEmail}</span></td>
                    <td className="py-3 pr-4 font-semibold">{amount.toFixed(2)} USDT</td>
                    <td className="py-3 pr-4">
                      <span className="text-destructive text-xs">-{fee.toFixed(2)}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-emerald-400 font-medium text-xs">{(amount - fee).toFixed(2)} USDT</span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground max-w-[120px] truncate">{w.walletAddress}</td>
                    <td className="py-3 pr-4">
                      <Badge className={`text-xs border ${conf.class}`}>{conf.label}</Badge>
                    </td>
                    <td className="py-3">
                      {w.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10" onClick={() => handleApprove(w)}>
                            <CheckCircle2 className="h-3 w-3" /> Approuver
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setRejectTarget(w); setReason(""); }}>
                            <XCircle className="h-3 w-3" /> Rejeter
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

      {/* Individual reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={open => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Rejeter le retrait</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Retrait de {rejectTarget?.amount} USDT — {rejectTarget?.userFirstName} {rejectTarget?.userLastName}</p>
            <p className="text-xs font-mono text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg break-all">{rejectTarget?.walletAddress}</p>
            <div className="space-y-2">
              <Label>Raison</Label>
              <Textarea placeholder="Motif du rejet..." value={reason} onChange={e => setReason(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectTarget(null)} className="flex-1">Annuler</Button>
              <Button variant="destructive" onClick={handleReject} disabled={reject.isPending} className="flex-1">Rejeter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk reject dialog */}
      <Dialog open={bulkRejecting} onOpenChange={setBulkRejecting}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Rejeter {selected.size} retrait(s)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Cette action va rejeter {selected.size} retrait(s) sélectionné(s).</p>
            <div className="space-y-2">
              <Label>Raison commune</Label>
              <Textarea placeholder="Motif du rejet..." value={bulkReason} onChange={e => setBulkReason(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setBulkRejecting(false)} className="flex-1">Annuler</Button>
              <Button variant="destructive" onClick={bulkReject} className="flex-1">Rejeter tout</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
