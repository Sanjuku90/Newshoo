import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/plans", label: "Plans" },
  { href: "/faq",   label: "FAQ" },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">
            InvestPro
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`text-sm font-medium transition-colors ${location === l.href ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex gap-4">
            <Link href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
              Connexion
            </Link>
            <Link href="/register"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              S'inscrire
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
            onClick={() => setDrawerOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="relative z-10 w-72 bg-card flex flex-col h-full shadow-2xl ml-auto">
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <Link href="/" className="text-xl font-bold tracking-tight text-primary" onClick={() => setDrawerOpen(false)}>
                InvestPro
              </Link>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`px-3 py-3 rounded-md text-sm font-medium transition-colors
                    ${location === l.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-border flex flex-col gap-2">
              <Link href="/login"
                onClick={() => setDrawerOpen(false)}
                className="block text-center px-4 py-3 rounded-md text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors">
                Connexion
              </Link>
              <Link href="/register"
                onClick={() => setDrawerOpen(false)}
                className="block text-center px-4 py-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                S'inscrire
              </Link>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} InvestPro. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
