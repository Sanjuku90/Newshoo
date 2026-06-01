import { useState, useRef } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Shield, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "admin@investpro.com";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const loginMutation = useLogin();
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleDigit = (d: string) => {
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) {
      setTimeout(() => submit(next), 120);
    }
  };

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError("");
  };

  const submit = (code: string) => {
    loginMutation.mutate(
      { data: { email: ADMIN_EMAIL, password: code } },
      {
        onSuccess: (data) => {
          login(data.token);
          setLocation("/admin");
        },
        onError: () => {
          setError("Code incorrect");
          setShake(true);
          setPin("");
          setTimeout(() => setShake(false), 600);
        },
      }
    );
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"];

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Espace Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Entrez votre code d'accès</p>
        </div>

        <div className={`flex justify-center gap-4 mb-3 transition-all ${shake ? "animate-bounce" : ""}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < pin.length
                  ? "bg-primary border-primary scale-110"
                  : "border-border bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-destructive mb-4 h-5">{error}</p>
        )}
        {!error && <div className="h-9" />}

        <div className="grid grid-cols-3 gap-3 mt-4">
          {digits.map((d, i) => (
            d === "" ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                onClick={() => handleDigit(d)}
                disabled={loginMutation.isPending}
                className="h-16 rounded-2xl bg-card border border-border text-2xl font-semibold text-foreground hover:bg-secondary/80 hover:border-primary/40 active:scale-95 transition-all disabled:opacity-50"
              >
                {d}
              </button>
            )
          ))}
          <button
            onClick={handleDelete}
            disabled={loginMutation.isPending || pin.length === 0}
            className="h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary/80 hover:text-foreground active:scale-95 transition-all disabled:opacity-40"
          >
            <Delete className="h-6 w-6" />
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          <a href="/login" className="hover:text-primary transition-colors">← Retour à l'accueil</a>
        </p>
      </div>
    </div>
  );
}
