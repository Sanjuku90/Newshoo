import { useState } from "react";
import { useListAdminKyc, useApproveKyc, useRejectKyc } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminKyc() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [viewDoc, setViewDoc] = useState<any>(null);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [reason, setReason] = useState("");

  const { data, isLoading, refetch } = useListAdminKyc({ status: statusFilter as any, page, limit: 20 });
  const approve = useApproveKyc();
  const reject = useRejectKyc();
  const { toast } = useToast();

  const handleApprove = (kyc: any) => {
    approve.mutate(
      { id: kyc.id },
      {
        onSuccess: () => { toast({ title: "KYC approved!" }); refetch(); },
        onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
      }
    );
  };

  const handleReject = () => {
    reject.mutate(
      { id: rejectTarget.id, data: { reason } },
      {
        onSuccess: () => { toast({ title: "KYC rejected" }); setRejectTarget(null); setReason(""); refetch(); },
        onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
      }
    );
  };

  const items = Array.isArray(data) ? data : ((data as any)?.items || []);

  const statusStyle: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    approved: "bg-accent/20 text-accent border-accent/30",
    rejected: "bg-destructive/20 text-destructive border-destructive/30",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">KYC Verification</h1>
        <p className="text-muted-foreground text-sm">Review user identity documents</p>
      </div>

      <div className="flex gap-2">
        {["pending", "approved", "rejected"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }} className="capitalize">{s}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <Card className="border-border"><CardContent className="py-12 text-center text-muted-foreground">No {statusFilter} KYC submissions</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((kyc: any) => (
            <Card key={kyc.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{kyc.userFirstName} {kyc.userLastName}</span>
                      <Badge className={`text-xs border ${statusStyle[kyc.status] || statusStyle.pending}`}>{kyc.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{kyc.userEmail} · {kyc.documentType?.replace(/_/g, " ")} · #{kyc.documentNumber}</div>
                    <div className="text-xs text-muted-foreground">Submitted: {new Date(kyc.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setViewDoc(kyc)} className="gap-1">
                      <ExternalLink className="h-3 w-3" /> View Docs
                    </Button>
                    {kyc.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1 text-accent border-accent/30 hover:bg-accent/10" onClick={() => handleApprove(kyc)}>
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setRejectTarget(kyc); setReason(""); }}>
                          <XCircle className="h-3 w-3" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewDoc} onOpenChange={open => { if (!open) setViewDoc(null); }}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader><DialogTitle>KYC Documents — {viewDoc?.userFirstName} {viewDoc?.userLastName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {[{ label: "Document Front", url: viewDoc?.documentFrontUrl }, { label: "Document Back", url: viewDoc?.documentBackUrl }, { label: "Selfie", url: viewDoc?.selfieUrl }].map(({ label, url }) => (
              <div key={label}>
                <div className="text-sm text-muted-foreground mb-2">{label}</div>
                {url ? (
                  <div>
                    <img src={url} alt={label} className="w-full rounded-lg border border-border max-h-48 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <a href={url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3" /> Open in new tab
                    </a>
                  </div>
                ) : <div className="text-xs text-muted-foreground">Not provided</div>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectTarget} onOpenChange={open => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Reject KYC</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Rejecting KYC for {rejectTarget?.userFirstName} {rejectTarget?.userLastName}</p>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea placeholder="Reason for rejection..." value={reason} onChange={e => setReason(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectTarget(null)} className="flex-1">Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={reject.isPending} className="flex-1">Reject KYC</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
