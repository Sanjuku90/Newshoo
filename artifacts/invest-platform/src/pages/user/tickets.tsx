import { useState } from "react";
import { useListTickets, useCreateTicket } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, MessageSquare, Plus, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; icon: any; class: string }> = {
  open: { label: "Open", icon: MessageSquare, class: "bg-primary/20 text-primary border-primary/30" },
  in_progress: { label: "In Progress", icon: Clock, class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  closed: { label: "Closed", icon: CheckCircle2, class: "bg-secondary text-muted-foreground border-border" },
};

export default function Tickets() {
  const { data: tickets, isLoading, refetch } = useListTickets();
  const createTicket = useCreateTicket();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", category: "general" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createTicket.mutate(
      { data: { subject: form.subject, message: form.message, category: form.category } },
      {
        onSuccess: () => {
          toast({ title: "Ticket created!", description: "Our team will respond within 24 hours." });
          setForm({ subject: "", message: "", category: "general" });
          setShowForm(false);
          refetch();
        },
        onError: (err: any) => setError(err?.data?.error || "Failed to create ticket"),
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Support Tickets</h1>
          <p className="text-muted-foreground text-sm">Get help from our support team</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : tickets && (tickets as any[]).length > 0 ? (
        <div className="space-y-3">
          {(tickets as any[]).map((ticket) => {
            const conf = statusConfig[ticket.status] || statusConfig.open;
            const Icon = conf.icon;
            return (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <Card className="border-border hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="font-medium">{ticket.subject}</span>
                        <Badge className={`text-xs border ${conf.class}`}><Icon className="h-3 w-3 mr-1" />{conf.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">{ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{ticket.messageCount || 0} messages</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>No tickets yet. Create one if you need help.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="general">General</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="investment">Investment</option>
                <option value="kyc">KYC Verification</option>
                <option value="technical">Technical Issue</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Brief description of your issue" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Describe your issue in detail..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} required />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={createTicket.isPending} className="flex-1">
                {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
