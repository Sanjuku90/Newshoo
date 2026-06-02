import { useState, useEffect, useRef } from "react";
import { Bell, BellDot, CheckCheck, Info, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  deposit_approved: <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />,
  deposit_rejected: <XCircle className="h-4 w-4 text-destructive shrink-0" />,
  withdrawal_approved: <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />,
  withdrawal_rejected: <XCircle className="h-4 w-4 text-destructive shrink-0" />,
  broadcast: <Info className="h-4 w-4 text-primary shrink-0" />,
};

export function NotificationsBell() {
  const { token } = useAuth() as any;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/notifications/unread-count", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setUnread(d.count); }
    } catch {}
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setNotifications(await r.json());
    } catch {}
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
      markAllRead();
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-md hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        {unread > 0 ? <BellDot className="h-5 w-5 text-primary" /> : <Bell className="h-5 w-5 text-muted-foreground" />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">Notifications</span>
            {notifications.some(n => !n.isRead) && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <CheckCheck className="h-3.5 w-3.5" /> Tout lire
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Aucune notification
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 ${n.isRead ? "" : "bg-primary/5"}`}>
                  <div className="mt-0.5">{typeIcon[n.type] || <Info className="h-4 w-4 text-muted-foreground shrink-0" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(n.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
