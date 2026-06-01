import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark">
      <header className="container mx-auto px-4 h-16 flex items-center">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          InvestPro
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
