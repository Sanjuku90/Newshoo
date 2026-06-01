import { Link } from "wouter";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">
            InvestPro
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/plans" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Plans
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
              Login
            </Link>
            <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} InvestPro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
