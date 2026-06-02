import { useState, useEffect, useRef } from "react";
import { useListAdminTickets, useCloseTicket, useGetTicket } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, XCircle, Shield, User, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSocket } from "@/lib/socket";

const statusConfig: Record<string, string> = {
  open: "bg-primary/20 text-primary border-primary/30",
  replied: "bg-green-500/20 text-green-400 border-green-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  closed: "bg-secondary text-muted-foreground border-border",
};

const statusLabel: Record<string, string> = {
  open: "Ouvert",
  replied: "Répondu",
  in_progress: "En cours",
  closed: "Fermé",
};

interface ChatMessage {
  id: number;
  message: string;
  isAdmin: boolean;
  authorName: string;
  createdAt: string;
}

export default function AdminTickets() {
  const [statusFilter, setStatusFilter] = useState("open");
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [liveStatus, setLiveStatus] = useState<string>("");
  const [unreadTickets, setUnreadTickets] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("auth_token");

  const { data, isLoading, refetch } = useListAdminTickets({ status: statusFilter as any, page, limit: 20 } as any);
  const { data: ticketDetail } = useGetTicket(selectedTicket?.id ?? 0, {
    query: { enabled: !!selectedTicket?.id } as any,
  });
  const closeTicket = useCloseTicket();
  const { toast } = useToast();

  useEffect(() => {
    if (ticketDetail && selectedTicket) {
      const detail = ticketDetail as any;
      setLiveMessages(detail.messages ?? []);
      setLiveStatus(detail.status ?? selectedTicket.status);
    }
  }, [ticketDetail, selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages]);

  useEffect(() => {
    if (!token) return;
    const s = getSocket(token);

    const onNewMessage = (msg: ChatMessage & { ticketId: number }) => {
      if (selectedTicket && msg.ticketId === selectedTicket.id) {
        setLiveMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } else {
        setUnreadTickets(prev => new Set(prev).add(msg.ticketId));
      }
      refetch();
    };

    const onTicketUpdated = (data: { ticketId: number; status: string }) => {
      if (selectedTicket && data.ticketId === selectedTicket.id) {
        setLiveStatus(data.status);
      }
      refetch();
    };

    s.on("new_message", onNewMessage);
    s.on("ticket_updated", onTicketUpdated);

    return () => {
      s.off("new_message", onNewMessage);
      s.off("ticket_updated", onTicketUpdated);
    };
  }, [token, selectedTicket?.id, refetch]);

  const openTicketDialog = (ticket: any) => {
    if (!token) return;
    if (selectedTicket?.id) {
      const s = getSocket(token);
      s.emit("leave_ticket", selectedTicket.id);
    }
    setSelectedTicket(ticket);
    setLiveMessages([]);
    setLiveStatus(ticket.status);
    setUnreadTickets(prev => { const n = new Set(prev); n.delete(ticket.id); return n; });
    const s = getSocket(token);
    s.emit("join_ticket", ticket.id);
  };

  const closeDialog = () => {
    if (!token || !selectedTicket) return;
    const s = getSocket(token);
    s.emit("leave_ticket", selectedTicket.id);
    setSelectedTicket(null);
    setLiveMessages([]);
    setLiveStatus("");
    setReply("");
  };

  const handleReply = () => {
    if (!reply.trim() || !selectedTicket || !token || sending) return;
    setSending(true);
    const s = getSocket(token);
    s.emit("send_message", { ticketId: selectedTicket.id, message: reply.trim() });
    setReply("");
    setSending(false);
    toast({ title: "Réponse envoyée !" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const handleClose = (id: number) => {
    closeTicket.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Ticket fermé" });
          setLiveStatus("closed");
          closeDialog();
          refetch();
        },
        onError: (err: any) => toast({ title: "Erreur", description: err?.data?.error, variant: "destructive" }),
      }
    );
  };

  const items = Array.isArray(data) ? data : ((data as any)?.tickets || []);
  const currentStatus = liveStatus || selectedTicket?.status;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Support Tickets</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Chat en direct actif
        </div>
      </div>

      <div className="flex gap-2">
        {["open", "replied", "in_progress", "closed"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
            onClick={() => { setStatusFilter(s); setPage(1); }} className="capitalize">
            {statusLabel[s] || s}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <Card className="border-border"><CardContent className="py-12 text-center text-muted-foreground">Aucun ticket {statusLabel[statusFilter]?.toLowerCase()}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((ticket: any) => (
            <Card key={ticket.id} className={`border-border cursor-pointer hover:border-primary/30 transition-colors ${unreadTickets.has(ticket.id) ? "border-primary/50 bg-primary/5" : ""}`}
              onClick={() => openTicketDialog(ticket)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {unreadTickets.has(ticket.id) && <Circle className="h-2 w-2 fill-primary text-primary" />}
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">{ticket.subject}</span>
                    <Badge className={`text-xs border ${statusConfig[ticket.status]}`}>{statusLabel[ticket.status] || ticket.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ticket.userFirstName} {ticket.userLastName} · {ticket.category} · {new Date(ticket.createdAt).toLocaleDateString("fr")}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{ticket.messageCount || 0} msg</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTicket} onOpenChange={open => { if (!open) closeDialog(); }}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTicket?.subject}
              {currentStatus && (
                <Badge className={`text-xs border ${statusConfig[currentStatus]}`}>{statusLabel[currentStatus] || currentStatus}</Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {selectedTicket?.userFirstName} {selectedTicket?.userLastName} · {selectedTicket?.userEmail} · Chat en direct
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 my-2 min-h-0">
            {liveMessages.map((msg: any) => {
              const isAdmin = msg.isAdmin === true || msg.isAdmin === "true";
              return (
                <div key={msg.id} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? "bg-primary/20" : "bg-secondary"}`}>
                    {isAdmin ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <div className={`flex-1 max-w-sm ${isAdmin ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-xl px-3 py-2 text-sm ${isAdmin ? "bg-primary/10 border border-primary/20" : "bg-card border border-border"}`}>
                      {msg.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {isAdmin ? "Support" : "Utilisateur"} · {new Date(msg.createdAt).toLocaleString("fr")}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {currentStatus !== "closed" && (
            <div className="space-y-3 border-t border-border pt-4">
              <Textarea
                placeholder="Répondre... (Entrée pour envoyer)"
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={handleReply} disabled={sending || !reply.trim()} className="gap-2 flex-1">
                  <Send className="h-4 w-4" /> Envoyer
                </Button>
                <Button variant="outline" onClick={() => handleClose(selectedTicket.id)} disabled={closeTicket.isPending} className="gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4" /> Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
