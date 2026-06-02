import { useState, useEffect, useRef } from "react";
import { useGetTicket, useReplyTicket } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, Send, User, Shield } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getSocket } from "@/lib/socket";

const statusConfig: Record<string, { label: string; class: string }> = {
  open: { label: "Ouvert", class: "bg-primary/20 text-primary border-primary/30" },
  replied: { label: "Répondu", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  in_progress: { label: "En cours", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  closed: { label: "Fermé", class: "bg-secondary text-muted-foreground border-border" },
};

interface ChatMessage {
  id: number;
  message: string;
  isAdmin: boolean;
  authorName: string;
  createdAt: string;
}

export default function TicketDetail({ id }: { id: string }) {
  const numId = parseInt(id);
  const { data: ticket, isLoading } = useGetTicket(numId, { query: { enabled: !isNaN(numId) } as any });
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("auth_token");

  const t = ticket as any;

  useEffect(() => {
    if (t?.messages) setLiveMessages(t.messages);
    if (t?.status) setStatus(t.status);
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages]);

  useEffect(() => {
    if (!token || isNaN(numId)) return;
    const s = getSocket(token);
    s.emit("join_ticket", numId);

    const onNewMessage = (msg: ChatMessage) => {
      setLiveMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onTicketUpdated = (data: { ticketId: number; status: string }) => {
      if (data.ticketId === numId) setStatus(data.status);
    };

    s.on("new_message", onNewMessage);
    s.on("ticket_updated", onTicketUpdated);

    return () => {
      s.off("new_message", onNewMessage);
      s.off("ticket_updated", onTicketUpdated);
      s.emit("leave_ticket", numId);
    };
  }, [token, numId]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!message.trim() || !token || sending) return;
    setSending(true);
    const s = getSocket(token);
    s.emit("send_message", { ticketId: numId, message: message.trim() });
    setMessage("");
    setSending(false);
    toast({ title: "Message envoyé !" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply(e as any);
    }
  };

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  const currentStatus = status || t?.status || "open";
  const conf = statusConfig[currentStatus] || statusConfig.open;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tickets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour aux tickets
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{t?.subject}</h1>
          <Badge className={`text-xs border ${conf.class}`}>{conf.label}</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="capitalize">{t?.category} · {t?.createdAt ? new Date(t.createdAt).toLocaleDateString("fr") : ""} · Chat en direct</span>
        </div>
      </div>

      <div className="space-y-4">
        {liveMessages.map((msg: any) => {
          const isAdmin = msg.isAdmin === true || msg.isAdmin === "true";
          return (
            <div key={msg.id} className={`flex gap-3 ${isAdmin ? "" : "flex-row-reverse"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? "bg-primary/20" : "bg-secondary"}`}>
                {isAdmin ? <Shield className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className={`flex-1 max-w-xl ${isAdmin ? "" : "text-right"}`}>
                <div className={`inline-block rounded-xl px-4 py-3 text-sm ${isAdmin ? "bg-card border border-border" : "bg-primary/10 border border-primary/20"}`}>
                  {msg.message}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {isAdmin ? "Support" : "Vous"} · {new Date(msg.createdAt).toLocaleString("fr")}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {currentStatus !== "closed" && (
        <Card className="border-border">
          <CardContent className="p-4">
            {error && (
              <div className="mb-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            <form onSubmit={handleReply} className="space-y-3">
              <Textarea
                placeholder="Votre message... (Entrée pour envoyer)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                required
              />
              <Button type="submit" disabled={sending || !message.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                {sending ? "Envoi..." : "Envoyer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
