import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Loader2, LayoutDashboard, Users, Wallet, ArrowDownToLine, ArrowUpFromLine, FileText, ShieldCheck, Settings, LogOut, TrendingUp } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout: clearAuth } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearAuth();
        setLocation("/login");
      }
    });
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
    { href: "/admin/investments", label: "Investments", icon: TrendingUp },
    { href: "/admin/kyc", label: "KYC", icon: ShieldCheck },
    { href: "/admin/tickets", label: "Tickets", icon: FileText },
    { href: "/admin/plans", label: "Plans", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground dark">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">InvestPro</Link>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-semibold">ADMIN</span>
        </div>
        <div className="p-4 flex-1 overflow-auto">
          <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4 px-2">Administration</div>
          <nav className="flex flex-col gap-1">
            {navItems.map(item => {
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
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-3 px-2">Signed in as <span className="text-foreground">{user.firstName}</span></div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary mb-1">
            <Wallet className="w-4 h-4" />
            User Dashboard
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-8">
          <h1 className="text-sm font-medium text-muted-foreground">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
