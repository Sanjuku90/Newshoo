import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  Loader2, LayoutDashboard, Users, Wallet, ArrowDownToLine, ArrowUpFromLine,
  FileText, ShieldCheck, Settings, LogOut, TrendingUp, ClipboardList, Tag,
  Clock, Megaphone, Menu, X
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";
import { Logo } from "@/components/logo";

const navGroups = [
  {
    label: "Vue d'ensemble",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Utilisateurs",
    items: [
      { href: "/admin/users", label: "Utilisateurs", icon: Users },
      { href: "/admin/kyc",   label: "KYC",          icon: ShieldCheck },
    ],
  },
  {
    label: "Finances",
    items: [
      { href: "/admin/deposits",     label: "Dépôts",          icon: ArrowDownToLine },
      { href: "/admin/withdrawals",  label: "Retraits",        icon: ArrowUpFromLine },
      { href: "/admin/investments",  label: "Investissements", icon: TrendingUp },
    ],
  },
  {
    label: "Support & Config",
    items: [
      { href: "/admin/tickets",      label: "Tickets",     icon: FileText },
      { href: "/admin/plans",        label: "Plans",       icon: Settings },
      { href: "/admin/promo-codes",  label: "Codes Promo", icon: Tag },
      { href: "/admin/settings",     label: "Paramètres",  icon: Settings },
    ],
  },
  {
    label: "Communication",
    items: [{ href: "/admin/broadcast", label: "Messagerie", icon: Megaphone }],
  },
  {
    label: "Audit",
    items: [
      { href: "/admin/logs", label: "Journal Admin",  icon: ClipboardList },
      { href: "/admin/cron", label: "Profits Cron",   icon: Clock },
    ],
  },
];

function SidebarContent({
  location, user, onLogout, onClose,
}: {
  location: string;
  user: any;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="h-16 flex items-center justify-between px-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Link href="/"><Logo iconSize={30} textClassName="text-base" /></Link>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-semibold">ADMIN</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="p-3 flex-1 overflow-auto">
        {navGroups.map(group => (
          <div key={group.label} className="mb-4">
            <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-1 px-2">
              {group.label}
            </div>
            <nav className="flex flex-col gap-0.5">
              {group.items.map(item => {
                const active = location === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium
                      ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-3 px-2">
          Connecté : <span className="text-foreground font-medium">{user.firstName}</span>
        </div>
        <Link href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary mb-1">
          <Wallet className="w-4 h-4" />
          Dashboard utilisateur
        </Link>
        <button onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout: clearAuth } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) setLocation("/admin-login");
    else if (!isLoading && user && user.role !== "admin") setLocation("/dashboard");
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => { clearAuth(); setLocation("/admin-login"); }
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground dark">

      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <SidebarContent location={location} user={user} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="relative z-10 w-72 bg-card flex flex-col h-full shadow-2xl">
            <SidebarContent
              location={location}
              user={user}
              onLogout={handleLogout}
              onClose={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-4 md:px-8 gap-4">
          <button
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
            onClick={() => setDrawerOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">Panneau d'administration</span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
