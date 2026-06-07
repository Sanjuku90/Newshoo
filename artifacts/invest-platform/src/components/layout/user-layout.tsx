import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  Loader2, LayoutDashboard, Wallet, ArrowDownToLine, ArrowUpFromLine,
  Users, Settings, LogOut, History, TrendingUp, FileText, Menu, X, ShieldCheck
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";
import { NotificationsBell } from "@/components/notifications-bell";
import { LiveChatWidget } from "@/components/live-chat-widget";

const navItems = [
  { href: "/dashboard",    label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/investments",  label: "Investissements", icon: TrendingUp },
  { href: "/deposit",      label: "Dépôt",           icon: ArrowDownToLine },
  { href: "/withdraw",     label: "Retrait",         icon: ArrowUpFromLine },
  { href: "/referrals",    label: "Parrainage",      icon: Users },
  { href: "/history",      label: "Historique",      icon: History },
  { href: "/tickets",      label: "Support",         icon: FileText },
  { href: "/profile",      label: "Profil",          icon: Settings },
];

const bottomNav = [
  { href: "/dashboard",   label: "Accueil",   icon: LayoutDashboard },
  { href: "/investments", label: "Investir",  icon: TrendingUp },
  { href: "/deposit",     label: "Dépôt",     icon: ArrowDownToLine },
  { href: "/withdraw",    label: "Retrait",   icon: ArrowUpFromLine },
  { href: "/profile",     label: "Profil",    icon: Settings },
];

export function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout: clearAuth } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [user, isLoading, setLocation]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => { clearAuth(); setLocation("/login"); }
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
      <aside className="w-64 bg-card border-r border-border flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">InvestPro</Link>
        </div>
        <div className="p-4 flex-1">
          <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4 px-2">Menu</div>
          <nav className="flex flex-col gap-1">
            {navItems.map(item => {
              const active = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium
                    ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          {(user as any).role === "admin" && (
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-primary hover:bg-primary/10 mb-1">
              <ShieldCheck className="w-4 h-4" /> Espace Admin
            </Link>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile drawer overlay ─────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="relative z-10 w-72 bg-card flex flex-col h-full shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <Link href="/" className="text-xl font-bold tracking-tight text-primary">InvestPro</Link>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3 px-2">Menu</div>
              <nav className="flex flex-col gap-1">
                {navItems.map(item => {
                  const active = location === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors text-sm font-medium
                        ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-border">
              {(user as any).role === "admin" && (
                <Link href="/admin" className="flex items-center gap-3 px-3 py-3 w-full rounded-md text-sm font-medium text-primary hover:bg-primary/10 mb-1">
                  <ShieldCheck className="w-4 h-4" /> Espace Admin
                </Link>
              )}
              <div className="text-xs text-muted-foreground px-3 mb-2">
                Connecté : <span className="text-foreground font-medium">{(user as any).firstName} {(user as any).lastName}</span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-4 md:px-8">
          <button
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
            onClick={() => setDrawerOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="md:hidden text-lg font-bold tracking-tight text-primary">InvestPro</Link>
          <div className="ml-auto flex items-center gap-3">
            <NotificationsBell />
            <div className="text-sm font-medium">
              <span className="text-muted-foreground mr-2 hidden sm:inline">Bonjour,</span>
              {(user as any).firstName} {(user as any).lastName}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      <LiveChatWidget />

      {/* ── Mobile bottom navigation bar ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-around px-1 h-16 safe-area-bottom">
        {bottomNav.map(item => {
          const active = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-md transition-colors
                ${active ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-md text-muted-foreground">
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Plus</span>
        </button>
      </nav>
    </div>
  );
}
