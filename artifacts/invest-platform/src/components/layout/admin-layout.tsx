import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Loader2, LayoutDashboard, Users, Wallet, ArrowDownToLine, ArrowUpFromLine, FileText, ShieldCheck, Settings, LogOut, TrendingUp, ClipboardList, Tag, Clock } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout: clearAuth } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/admin-login");
    else if (!isLoading && user && user.role !== "admin") setLocation("/dashboard");
  }, [user, isLoading, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => { clearAuth(); setLocation("/admin-login"); }
    });
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const navGroups = [
    {
      label: "Vue d'ensemble",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Utilisateurs",
      items: [
        { href: "/admin/users", label: "Utilisateurs", icon: Users },
        { href: "/admin/kyc", label: "KYC", icon: ShieldCheck },
      ],
    },
    {
      label: "Finances",
      items: [
        { href: "/admin/deposits", label: "Dépôts", icon: ArrowDownToLine },
        { href: "/admin/withdrawals", label: "Retraits", icon: ArrowUpFromLine },
        { href: "/admin/investments", label: "Investissements", icon: TrendingUp },
      ],
    },
    {
      label: "Support & Config",
      items: [
        { href: "/admin/tickets", label: "Tickets", icon: FileText },
        { href: "/admin/plans", label: "Plans", icon: Settings },
        { href: "/admin/promo-codes", label: "Codes Promo", icon: Tag },
      ],
    },
    {
      label: "Audit",
      items: [
        { href: "/admin/logs", label: "Journal Admin", icon: ClipboardList },
        { href: "/admin/cron", label: "Profits Cron", icon: Clock },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground dark">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">InvestPro</Link>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-semibold">ADMIN</span>
        </div>
        <div className="p-3 flex-1 overflow-auto">
          {navGroups.map(group => (
            <div key={group.label} className="mb-4">
              <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-1 px-2">{group.label}</div>
              <nav className="flex flex-col gap-0.5">
                {group.items.map(item => {
                  const active = location === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-3 px-2">Connecté en tant que <span className="text-foreground">{user.firstName}</span></div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary mb-1">
            <Wallet className="w-4 h-4" />
            Dashboard utilisateur
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-8">
          <h1 className="text-sm font-medium text-muted-foreground">Panneau d'administration</h1>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
