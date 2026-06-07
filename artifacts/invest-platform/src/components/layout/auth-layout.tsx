import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { Loader2, TrendingUp, Shield, Zap, Users } from "lucide-react";

const perks = [
  { icon: TrendingUp, label: "Jusqu'à 36 $/jour", sub: "Gains quotidiens automatiques" },
  { icon: Shield, label: "Sécurisé", sub: "Blockchain USDT TRC20" },
  { icon: Zap, label: "Retraits rapides", sub: "En moins de 24h" },
  { icon: Users, label: "Parrainage", sub: "3 niveaux de commissions" },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-[#0c0e11]">
        <Loader2 className="animate-spin text-emerald-400 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0c0e11] flex">
      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 border-r border-white/5 relative overflow-hidden bg-gradient-to-br from-[#0f1219] to-[#0c0e11]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <Link href="/" className="text-xl font-bold text-white">InvestPro</Link>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug mb-3">
              Votre capital,<br />
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                en pleine croissance.
              </span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Investissez vos USDT et recevez des profits quotidiens directement sur votre compte, 7 jours sur 7.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {perks.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                <Icon className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-2xl">💡</div>
            <div>
              <div className="text-xs font-semibold text-emerald-300">Bon à savoir</div>
              <div className="text-xs text-gray-400 mt-0.5">Vous pouvez commencer avec seulement 69 USDT et retirer dès 9 $ de gains.</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-700">
          © {new Date().getFullYear()} InvestPro · Les investissements comportent des risques.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 py-12 overflow-auto">
        {children}
      </div>
    </div>
  );
}
