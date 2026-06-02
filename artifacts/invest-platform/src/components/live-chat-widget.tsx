import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, ChevronDown, Plus, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { getSocket } from "@/lib/socket";
import { useCreateTicket, useListTickets, useGetTicket } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
  id: number;
  message: string;
  isAdmin: boolean;
  authorName: string;
  createdAt: string;
}

export function LiveChatWidget() {
  const { user } = useAuth();
  const token = localStorage.getItem("auth_token");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "chat" | "new">("list");
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newForm, setNewForm] = useState({ subject: "", category: "general", message: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: tickets, refetch: refetchTickets } = useListTickets();
  const { data: ticketDetail } = useGetTicket(activeTicketId ?? 0, {
    query: { enabled: !!activeTicketId } as any,
  });
  const createTicket = useCreateTicket();

  const ticketList = Array.isArray(tickets) ? tickets : [];

  useEffect(() => {
    if (!token || !user) return;
    const s = getSocket(token);
    s.emit("join_user_room");

    const onAdminReplied = (data: { ticketId: number; subject: string }) => {
      setUnreadCount(c => c + 1);
      refetchTickets();
      if (activeTicketId === data.ticketId) {
        refetchTickets();
      }
    };

    const onNewMessage = (msg: ChatMessage) => {
      if (activeTicketId && open) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setUnreadCount(0);
      } else {
        setUnreadCount(c => c + 1);
      }
    };

    s.on("admin_replied", onAdminReplied);
    s.on("new_message", onNewMessage);

    return () => {
      s.off("admin_replied", onAdminReplied);
      s.off("new_message", onNewMessage);
    };
  }, [token, user, activeTicketId, open, refetchTickets]);

  useEffect(() => {
    if (ticketDetail && activeTicketId) {
      const detail = ticketDetail as any;
      setMessages(detail.messages ?? []);
    }
  }, [ticketDetail, activeTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openTicket = (ticketId: number) => {
    if (!token) return;
    setActiveTicketId(ticketId);
    setView("chat");
    setUnreadCount(0);
    const s = getSocket(token);
    s.emit("join_ticket", ticketId);
  };

  const leaveTicket = () => {
    if (!token || !activeTicketId) return;
    const s = getSocket(token);
    s.emit("leave_ticket", activeTicketId);
    setActiveTicketId(null);
    setMessages([]);
    setView("list");
  };

  const sendMessage = () => {
    if (!input.trim() || !activeTicketId || !token || sending) return;
    setSending(true);
    const s = getSocket(token);
    s.emit("send_message", { ticketId: activeTicketId, message: input.trim() });
    setInput("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCreate = async () => {
    if (!newForm.subject || !newForm.message) return;
    createTicket.mutate(
      { data: { subject: newForm.subject, category: newForm.category, message: newForm.message } },
      {
        onSuccess: (ticket: any) => {
          setNewForm({ subject: "", category: "general", message: "" });
          refetchTickets();
          openTicket(ticket.id);
        },
      }
    );
  };

  if (!user || !token) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: 480 }}>
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-primary-foreground font-semibold text-sm">Support en direct</span>
            </div>
            <div className="flex items-center gap-1">
              {view === "chat" && (
                <button onClick={leaveTicket} className="text-primary-foreground/70 hover:text-primary-foreground p-1 rounded">
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground p-1 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List view */}
          {view === "list" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {ticketList.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>Aucune conversation</p>
                    <p className="text-xs mt-1">Démarrez une discussion avec notre support</p>
                  </div>
                ) : (
                  ticketList.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => openTicket(t.id)}
                      className="w-full text-left p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors border border-border"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{t.subject}</span>
                        <Badge className={`text-[10px] ml-2 shrink-0 ${
                          t.status === "open" ? "bg-primary/20 text-primary" :
                          t.status === "replied" ? "bg-green-500/20 text-green-400" :
                          "bg-secondary text-muted-foreground"
                        }`}>{t.status === "replied" ? "Répondu" : t.status === "open" ? "Ouvert" : "Fermé"}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{t.messageCount} message(s)</div>
                    </button>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border">
                <Button size="sm" className="w-full gap-2" onClick={() => setView("new")}>
                  <Plus className="h-4 w-4" /> Nouvelle conversation
                </Button>
              </div>
            </div>
          )}

          {/* New ticket view */}
          {view === "new" && (
            <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              <button onClick={() => setView("list")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
                <ChevronDown className="h-3 w-3 rotate-90" /> Retour
              </button>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Catégorie</label>
                  <select
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground"
                    value={newForm.category}
                    onChange={e => setNewForm(p => ({ ...p, category: e.target.value }))}
                  >
                    <option value="general">Général</option>
                    <option value="deposit">Dépôt</option>
                    <option value="withdrawal">Retrait</option>
                    <option value="investment">Investissement</option>
                    <option value="kyc">KYC</option>
                    <option value="technical">Technique</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Sujet</label>
                  <Input
                    placeholder="Décrivez brièvement votre problème"
                    value={newForm.subject}
                    onChange={e => setNewForm(p => ({ ...p, subject: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                  <Textarea
                    placeholder="Décrivez votre problème en détail..."
                    value={newForm.message}
                    onChange={e => setNewForm(p => ({ ...p, message: e.target.value }))}
                    rows={4}
                    className="text-sm resize-none"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={createTicket.isPending || !newForm.subject || !newForm.message}
                >
                  {createTicket.isPending ? "Envoi..." : "Démarrer la conversation"}
                </Button>
              </div>
            </div>
          )}

          {/* Chat view */}
          {view === "chat" && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.isAdmin ? "" : "flex-row-reverse"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.isAdmin ? "bg-primary/20" : "bg-secondary"}`}>
                      {msg.isAdmin ? <Shield className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className={`max-w-[75%] ${msg.isAdmin ? "" : "text-right"}`}>
                      <div className={`inline-block rounded-2xl px-3 py-2 text-sm ${msg.isAdmin ? "bg-secondary border border-border" : "bg-primary text-primary-foreground"}`}>
                        {msg.message}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Textarea
                  placeholder="Votre message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="resize-none text-sm flex-1"
                />
                <Button size="sm" onClick={sendMessage} disabled={!input.trim() || sending} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) setUnreadCount(0); }}
        className="w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors relative"
      >
        {open ? <X className="h-6 w-6 text-primary-foreground" /> : <MessageCircle className="h-6 w-6 text-primary-foreground" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
