import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Loader2, LayoutDashboard, Wallet, ArrowDownToLine, ArrowUpFromLine, Users, Settings, LogOut } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

export function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout: clearAuth } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
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
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/investments", label: "Investments", icon: Wallet },
    { href: "/deposit", label: "Deposit", icon: ArrowDownToLine },
    { href: "/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
    { href: "/referrals", label: "Referrals", icon: Users },
    { href: "/profile", label: "Profile", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground dark">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">
            InvestPro
          </Link>
        </div>
        <div className="p-4">
          <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4 px-2">Menu</div>
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
        <div className="mt-auto p-4 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-4 md:px-8">
          <div className="md:hidden">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary">InvestPro</Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm font-medium">
              <span className="text-muted-foreground mr-2">Welcome,</span>
              {user.firstName} {user.lastName}
            </div>
            {user.role === 'admin' && (
              <Link href="/admin" className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Admin Panel</Link>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
