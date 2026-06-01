import { useState } from "react";
import { useGetTicket, useReplyTicket } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, Send, User, Shield } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; class: string }> = {
  open: { label: "Open", class: "bg-primary/20 text-primary border-primary/30" },
  in_progress: { label: "In Progress", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  closed: { label: "Closed", class: "bg-secondary text-muted-foreground border-border" },
};

export default function TicketDetail({ id }: { id: string }) {
  const numId = parseInt(id);
  const { data: ticket, isLoading, refetch } = useGetTicket(numId, { query: { enabled: !isNaN(numId) } as any });
  const replyTicket = useReplyTicket();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    replyTicket.mutate(
      { id: numId, data: { message } },
      {
        onSuccess: () => {
          setMessage("");
          refetch();
          toast({ title: "Reply sent!" });
        },
        onError: (err: any) => setError(err?.data?.error || "Failed to send reply"),
      }
    );
  };

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  const t = ticket as any;
  const conf = statusConfig[t?.status] || statusConfig.open;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tickets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">{t?.subject}</h1>
          <Badge className={`text-xs border ${conf.class}`}>{conf.label}</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1 capitalize">{t?.category} · {t?.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}</div>
      </div>

      <div className="space-y-4">
        {t?.messages?.map((msg: any) => {
          const isAdmin = msg.senderRole === "admin";
          return (
            <div key={msg.id} className={`flex gap-3 ${isAdmin ? "" : "flex-row-reverse"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? "bg-primary/20" : "bg-secondary"}`}>
                {isAdmin ? <Shield className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className={`flex-1 max-w-xl ${isAdmin ? "" : "text-right"}`}>
                <div className={`inline-block rounded-xl px-4 py-3 text-sm ${isAdmin ? "bg-card border border-border" : "bg-primary/10 border border-primary/20"}`}>
                  {msg.message}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{isAdmin ? "Support" : "You"} · {new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      {t?.status !== "closed" && (
        <Card className="border-border">
          <CardContent className="p-4">
            {error && (
              <div className="mb-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            <form onSubmit={handleReply} className="space-y-3">
              <Textarea
                placeholder="Type your reply..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                required
              />
              <Button type="submit" disabled={replyTicket.isPending || !message.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                {replyTicket.isPending ? "Sending..." : "Send Reply"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
