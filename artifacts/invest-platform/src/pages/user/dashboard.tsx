import { useEffect, useState } from "react";
import { useGetDashboardSummary, useListTransactions, useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, Users,
  Clock, AlertTriangle, Info, CheckCircle2, ChevronRight, Zap, Gift, Shield, Timer,
} from "lucide-react";

function useProfitCountdown() {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

function Progress({ value }: { value: number }) {
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function InvestmentCard({ inv }: { inv: any }) {
  const totalDays = inv.durationDays || 15;
  const daysLeft = inv.daysLeft ?? 0;
  const daysElapsed = totalDays - daysLeft;
  const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-white">{inv.planName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{inv.amount} USDT · {inv.dailyRate}%/jour</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-emerald-400">+{parseFloat(inv.totalEarned || 0).toFixed(2)} USDT</div>
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            {daysLeft > 0 ? `${daysLeft}j restants` : "Terminé"}
          </div>
        </div>
      </div>
      <Progress value={progress} />
      <div className="flex justify-between mt-2 text-[10px] text-gray-600">
        <span>Jour {daysElapsed}/{totalDays}</span>
        <span>{Math.round(progress)}% complété</span>
      </div>
    </div>
  );
}

function AnnouncementBanner({ text, type }: { text: string; type: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (!text || dismissed) return null;
  const config = {
    info:    { bg: "bg-blue-500/10 border-blue-500/20",       text: "text-blue-400",    icon: Info },
    warning: { bg: "bg-amber-500/10 border-amber-500/20",     text: "text-amber-400",   icon: AlertTriangle },
    success: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", icon: CheckCircle2 },
  }[type] ?? { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", icon: Info };
  const Icon = config.icon;
  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3.5 ${config.bg}`}>
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${config.text}`} />
      <p className={`text-sm flex-1 ${config.text}`}>{text}</p>
      <button onClick={() => setDismissed(true)} className="text-gray-600 hover:text-gray-400 text-lg leading-none shrink-0">×</button>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, gradient, sub }: {
  label: string; value: string; icon: any; gradient: string; sub?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-5 border overflow-hidden bg-gradient-to-br ${gradient}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</div>
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
    </div>
  );
}

const TX_LABEL: Record<string, string> = {
  deposit: "Dépôt", withdrawal: "Retrait", profit: "Profit",
  commission: "Commission", investment: "Investissement", bonus: "Bonus",
};

const KYC_STATUS: Record<string, { label: string; color: string }> = {
  none:     { label: "Non vérifié",  color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  pending:  { label: "En attente",   color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  approved: { label: "Vérifié ✓",   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  rejected: { label: "Refusé",       color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboardSummary();
  const { data: userMe } = useGetMe();
  const { data: transactions } = useListTransactions({ limit: 5 });
  const [announcement, setAnnouncement] = useState<{ text: string; type: string } | null>(null);
  const countdown = useProfitCountdown();
  const me = userMe as any;

  useEffect(() => {
    fetch("/api/settings/public")
      .then(r => r.json())
      .then(s => {
        if (s.announcement_active === "1" && s.announcement_text)
          setAnnouncement({ text: s.announcement_text, type: s.announcement_type || "info" });
      })
      .catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  const d = dashboard as any;
  const mainBalance = parseFloat(d?.mainBalance || "0").toFixed(2);
  const investedBalance = parseFloat(d?.investedBalance || "0").toFixed(2);
  const totalEarnings = parseFloat(d?.totalEarnings || "0").toFixed(2);
  const dailyEarnings = parseFloat(d?.dailyEarnings || "0").toFixed(2);
  const bonusBalance = parseFloat(me?.bonusBalance || "0").toFixed(2);
  const totalDeposited = parseFloat(me?.totalDeposited || "0").toFixed(2);
  const totalWithdrawn = parseFloat(me?.totalWithdrawn || "0").toFixed(2);
  const kycStatus = me?.kycStatus || "none";
  const kycConfig = KYC_STATUS[kycStatus] ?? KYC_STATUS.none;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble de vos investissements</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Countdown */}
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
            <Timer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="text-right">
              <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider leading-none mb-0.5">Prochain profit</div>
              <div className="text-sm font-mono font-bold text-emerald-300 leading-none">{countdown}</div>
            </div>
          </div>
          <Link href="/deposit" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
            <ArrowDownToLine className="w-3.5 h-3.5" /> Déposer
          </Link>
        </div>
      </div>

      {/* Mobile countdown */}
      <div className="sm:hidden flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
        <Timer className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider leading-none mb-0.5">Prochain crédit de profits</div>
          <div className="text-base font-mono font-bold text-emerald-300 leading-none">{countdown}</div>
        </div>
      </div>

      {announcement && <AnnouncementBanner text={announcement.text} type={announcement.type} />}

      {/* Stat cards — row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Solde principal" value={`${mainBalance}`} icon={Wallet}
          gradient="from-emerald-900/40 to-emerald-800/20 border-emerald-700/30"
          sub="USDT disponible" />
        <StatCard label="En investissement" value={`${investedBalance}`} icon={TrendingUp}
          gradient="from-blue-900/40 to-blue-800/20 border-blue-700/30"
          sub="USDT investis" />
        <StatCard label="Gains totaux" value={`${totalEarnings}`} icon={Zap}
          gradient="from-teal-900/40 to-teal-800/20 border-teal-700/30"
          sub="USDT gagnés" />
        <StatCard label="Gains / jour" value={`${dailyEarnings}`} icon={Clock}
          gradient="from-purple-900/40 to-purple-800/20 border-purple-700/30"
          sub="USDT / jour" />
      </div>

      {/* Stat cards — row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Solde bonus" value={`${bonusBalance}`} icon={Gift}
          gradient="from-orange-900/40 to-orange-800/20 border-orange-700/30"
          sub="USDT bonus" />
        <StatCard label="Total déposé" value={`${totalDeposited}`} icon={ArrowDownToLine}
          gradient="from-cyan-900/40 to-cyan-800/20 border-cyan-700/30"
          sub="USDT déposés" />
        <StatCard label="Total retiré" value={`${totalWithdrawn}`} icon={ArrowUpFromLine}
          gradient="from-rose-900/40 to-rose-800/20 border-rose-700/30"
          sub="USDT retirés" />
        <Link href="/profile" className={`relative rounded-2xl p-5 border overflow-hidden flex flex-col justify-between hover:opacity-90 transition-opacity ${kycConfig.color}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="text-xs font-medium uppercase tracking-wider opacity-70">Statut KYC</div>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold">{kycConfig.label}</div>
          <div className="text-xs opacity-50 mt-1">
            {kycStatus === "none" ? "Cliquer pour vérifier" : kycStatus === "approved" ? "Compte vérifié" : "Voir le profil"}
          </div>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/deposit",     label: "Dépôt",     icon: ArrowDownToLine, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15" },
          { href: "/withdraw",    label: "Retrait",   icon: ArrowUpFromLine, color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15" },
          { href: "/investments", label: "Investir",  icon: TrendingUp,      color: "text-teal-400",    bg: "bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/15" },
          { href: "/referrals",   label: "Parrainage",icon: Users,           color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15" },
        ].map(({ href, label, icon: Icon, color, bg }) => (
          <Link key={href} href={href} className={`flex items-center justify-center gap-2.5 border rounded-xl py-3.5 text-sm font-medium transition-colors ${bg} ${color}`}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Active investments */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Investissements actifs</h2>
            </div>
            <Link href="/investments" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
              Voir tout <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {d?.activeInvestments && d.activeInvestments.length > 0 ? (
              d.activeInvestments.map((inv: any) => <InvestmentCard key={inv.id} inv={inv} />)
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm text-gray-400 mb-3">Aucun investissement actif</p>
                <Link href="/investments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Commencer à investir <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Transactions récentes</h2>
            </div>
            <Link href="/history" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
              Historique <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {(transactions as any)?.items?.length > 0 ? (
              (transactions as any).items.map((tx: any) => {
                const isPositive = parseFloat(tx.amount) >= 0;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                        {isPositive
                          ? <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                          : <ArrowUpFromLine className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white capitalize">
                          {TX_LABEL[tx.type] || tx.type.replace(/_/g, " ")}
                        </div>
                        <div className="text-[10px] text-gray-600">
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                      {isPositive ? "+" : ""}{tx.amount} USDT
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-sm text-gray-400">Aucune transaction récente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral summary */}
      {d?.referral && (
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Réseau de parrainage</h2>
            </div>
            <Link href="/referrals" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
              Gérer <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(l => (
              <div key={l} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-300">{d.referral[`level${l}Count`] || 0}</div>
                <div className="text-xs text-gray-500 mt-1">Niveau {l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-sm text-gray-400">Commissions totales</span>
            <span className="font-bold text-purple-300">{d.referral.totalCommissions || "0"} USDT</span>
          </div>
        </div>
      )}
    </div>
  );
}
