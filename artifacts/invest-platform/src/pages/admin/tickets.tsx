import { useState } from "react";
import { useListAdminTickets, useAdminReplyTicket, useCloseTicket } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, XCircle, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, string> = {
  open: "bg-primary/20 text-primary border-primary/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  closed: "bg-secondary text-muted-foreground border-border",
};

export default function AdminTickets() {
  const [statusFilter, setStatusFilter] = useState("open");
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");

  const { data, isLoading, refetch } = useListAdminTickets({ status: statusFilter as any, page, limit: 20 } as any);
  const adminReply = useAdminReplyTicket();
  const closeTicket = useCloseTicket();
  const { toast } = useToast();

  const handleReply = () => {
    adminReply.mutate(
      { id: selectedTicket.id, data: { message: reply } },
      {
        onSuccess: () => { toast({ title: "Reply sent!" }); setReply(""); refetch(); },
        onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
      }
    );
  };

  const handleClose = (id: number) => {
    closeTicket.mutate(
      { id },
      {
        onSuccess: () => { toast({ title: "Ticket closed" }); setSelectedTicket(null); refetch(); },
        onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
      }
    );
  };

  const items = Array.isArray(data) ? data : ((data as any)?.tickets || []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Support Tickets</h1>
        <p className="text-muted-foreground text-sm">Manage user support requests</p>
      </div>

      <div className="flex gap-2">
        {["open", "in_progress", "closed"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => { setStatusFilter(s); setPage(1); }} className="capitalize">{s.replace(/_/g, " ")}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <Card className="border-border"><CardContent className="py-12 text-center text-muted-foreground">No {statusFilter} tickets</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((ticket: any) => (
            <Card key={ticket.id} className="border-border cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedTicket(ticket)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">{ticket.subject}</span>
                    <Badge className={`text-xs border ${statusConfig[ticket.status]}`}>{ticket.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ticket.userFirstName} {ticket.userLastName} · {ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{ticket.messageCount || 0} messages</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTicket} onOpenChange={open => { if (!open) setSelectedTicket(null); }}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <div className="text-xs text-muted-foreground">{selectedTicket?.userFirstName} {selectedTicket?.userLastName} · {selectedTicket?.userEmail}</div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 my-4 min-h-0">
            {selectedTicket?.messages?.map((msg: any) => {
              const isAdmin = msg.senderRole === "admin";
              return (
                <div key={msg.id} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? "bg-primary/20" : "bg-secondary"}`}>
                    {isAdmin ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <div className={`flex-1 max-w-sm ${isAdmin ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-xl px-3 py-2 text-sm ${isAdmin ? "bg-primary/10 border border-primary/20" : "bg-card border border-border"}`}>
                      {msg.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{isAdmin ? "Support" : "User"} · {new Date(msg.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedTicket?.status !== "closed" && (
            <div className="space-y-3 border-t border-border pt-4">
              <Textarea placeholder="Reply..." value={reply} onChange={e => setReply(e.target.value)} rows={2} />
              <div className="flex gap-2">
                <Button onClick={handleReply} disabled={adminReply.isPending || !reply.trim()} className="gap-2 flex-1">
                  <Send className="h-4 w-4" /> Send Reply
                </Button>
                <Button variant="outline" onClick={() => handleClose(selectedTicket.id)} disabled={closeTicket.isPending} className="gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4" /> Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
