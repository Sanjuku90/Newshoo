import { useState } from "react";
import { Link } from "wouter";
import { useListPlans } from "@workspace/api-client-react";
import { TrendingUp, Shield, Users, Zap, CheckCircle2, ArrowRight, Menu, X, Star, ChevronRight } from "lucide-react";

const FALLBACK_PLANS = [
  {
    id: "1", name: "Pack BRONZE", description: "Idéal pour débuter",
    minDeposit: "69", maxDeposit: "98", dailyRate: "14.4928", durationDays: 15,
    features: ["10 $ de gain par jour", "Retour total : 150 $", "Capital récupéré en 7 jours", "Retrait dès 9 $ de solde"],
  },
  {
    id: "2", name: "Pack SILVER", description: "Le meilleur rendement",
    minDeposit: "99", maxDeposit: "198", dailyRate: "17.1717", durationDays: 15,
    features: ["17 $ de gain par jour", "Retour total : 255 $", "Capital récupéré en 6 jours", "Retrait dès 9 $ de solde"],
  },
  {
    id: "3", name: "Pack GOLD", description: "Revenus maximaux",
    minDeposit: "199", maxDeposit: null, dailyRate: "18.0905", durationDays: 15,
    features: ["36 $ de gain par jour", "Retour total : 540 $", "Capital récupéré en 6 jours", "Retrait dès 9 $ de solde"],
  },
];

const TIER = [
  { label: "Starter",  color: "text-emerald-600", bg: "from-emerald-900/30 to-emerald-800/10", border: "border-emerald-800/40" },
  { label: "Populaire", color: "text-emerald-400", bg: "from-emerald-900/40 to-emerald-700/10", border: "border-emerald-500/60" },
  { label: "Premium",  color: "text-teal-300",    bg: "from-teal-900/30 to-teal-700/10",       border: "border-teal-600/50" },
];

export default function Home() {
  const { data: plansData } = useListPlans();
  const plans = (plansData && plansData.length > 0 ? plansData : FALLBACK_PLANS) as typeof FALLBACK_PLANS;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dark min-h-screen bg-[#0c0e11] text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0c0e11]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">InvestPro</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/plans" className="text-sm text-gray-400 hover:text-white transition-colors">Plans</Link>
            <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-5 py-2 rounded-lg hover:from-emerald-300 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
              Commencer →
            </Link>
          </div>

          <button className="md:hidden text-gray-400 hover:text-white p-1" onClick={() => setMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0f1219] border-l border-white/10 flex flex-col">
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
              <span className="font-bold text-white">InvestPro</span>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 p-4 flex-1">
              <Link href="/plans" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Plans</Link>
              <Link href="/faq" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">FAQ</Link>
            </div>
            <div className="p-4 border-t border-white/10 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-white hover:bg-white/5 transition-colors">Connexion</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-300 hover:to-emerald-400 transition-all">Commencer gratuitement</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-4 text-center relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-300 font-medium">Plateforme d'investissement USDT TRC20</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
          Faites fructifier<br />
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            votre capital USDT
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Jusqu'à <span className="text-emerald-400 font-semibold">36 $ de gains par jour</span> sur vos investissements.
          Transparent, sécurisé, et disponible 7j/7.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-bold px-8 py-4 rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all shadow-xl shadow-emerald-500/20 text-sm">
            Commencer à investir <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/plans" className="inline-flex items-center justify-center gap-2 border border-white/10 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/5 transition-all text-sm">
            Voir les plans <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
          {["🔒 Dépôts sécurisés", "⚡ Retraits en 24h", "🌍 Disponible partout", "🤝 Support 24/7"].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "36 $", label: "Gains max./jour", sub: "Pack GOLD" },
            { value: "69 $", label: "Dépôt minimum", sub: "Pack BRONZE" },
            { value: "3", label: "Niveaux parrainage", sub: "Commissions" },
            { value: "2%", label: "Frais de retrait", sub: "Parmi les plus bas" },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center hover:bg-white/[0.05] transition-colors">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{s.value}</div>
              <div className="text-sm font-medium text-white mb-0.5">{s.label}</div>
              <div className="text-xs text-gray-500">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Plans ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <div className="inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1 text-xs text-gray-400 mb-4">Nos offres</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Plans d'investissement</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Des gains quotidiens crédités automatiquement dès le premier jour.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const features: string[] = Array.isArray(plan.features) ? plan.features as string[] : JSON.parse((plan.features as string) || "[]");
            const daily = Math.round(parseFloat(plan.minDeposit) * parseFloat(String(plan.dailyRate)) / 100);
            const total = daily * plan.durationDays;
            const tier = TIER[i];
            const isPopular = i === 1;
            return (
              <div key={plan.id} className={`relative rounded-2xl border bg-gradient-to-b ${tier.bg} ${tier.border} p-6 flex flex-col gap-5 hover:scale-[1.02] transition-transform duration-200 ${isPopular ? "ring-1 ring-emerald-500/40 shadow-2xl shadow-emerald-500/10" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      ⭐ LE PLUS POPULAIRE
                    </span>
                  </div>
                )}

                <div>
                  <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${tier.color}`}>{tier.label}</div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${tier.color}`}>{daily} $</span>
                    <span className="text-gray-400 text-sm">/ jour</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Retour total estimé : <span className="text-gray-300 font-medium">{total} $</span></div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Dépôt minimum</span>
                    <span className="text-white font-semibold">{plan.minDeposit} USDT</span>
                  </div>
                  {plan.maxDeposit && (
                    <div className="flex justify-between text-gray-400">
                      <span>Dépôt maximum</span>
                      <span className="text-white font-semibold">{plan.maxDeposit} USDT</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Durée</span>
                    <span className="text-white font-semibold">{plan.durationDays} jours</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Taux journalier</span>
                    <span className={`font-semibold ${tier.color}`}>{parseFloat(String(plan.dailyRate)).toFixed(2)}%</span>
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${tier.color}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/register" className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${isPopular ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-300 hover:to-emerald-400 shadow-lg shadow-emerald-500/20" : "border border-white/10 text-white hover:bg-white/5"}`}>
                  Investir dans {plan.name}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20 border-t border-white/5">
        <div className="text-center mb-14">
          <div className="inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1 text-xs text-gray-400 mb-4">Simple & rapide</div>
          <h2 className="text-3xl font-bold text-white">Comment ça fonctionne ?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Créez votre compte", desc: "Inscription gratuite en moins de 2 minutes. Aucune vérification requise pour démarrer." },
            { step: "02", title: "Faites un dépôt USDT", desc: "Envoyez vos USDT TRC20 sur notre adresse de dépôt. Le plan est activé automatiquement." },
            { step: "03", title: "Recevez vos gains", desc: "Vos profits sont crédités chaque jour sur votre compte. Retirez quand vous le souhaitez." },
          ].map(s => (
            <div key={s.step} className="relative">
              <div className="text-6xl font-black text-white/[0.04] absolute -top-4 -left-2 select-none">{s.step}</div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <span className="text-emerald-400 text-sm font-bold">{s.step}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20 border-t border-white/5">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Shield, title: "Sécurisé", desc: "Dépôts et retraits via blockchain USDT TRC20 — traçable et transparent.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { icon: TrendingUp, title: "Profits quotidiens", desc: "Gains crédités automatiquement chaque jour sans aucune action de votre part.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { icon: Users, title: "Parrainage 3 niveaux", desc: "Gagnez des commissions sur 3 niveaux de filleuls. Invitez et multipliez vos revenus.", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { icon: Zap, title: "Retraits rapides", desc: "Retirez vos gains en 24h avec seulement 2% de frais. Minimum 9 USDT.", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.04] transition-colors">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900/30 via-emerald-900/20 to-teal-900/20 border border-emerald-500/20 p-10 md:p-14 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-emerald-400 fill-emerald-400" />)}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à faire fructifier<br />votre argent ?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Rejoignez des milliers d'investisseurs qui font confiance à InvestPro pour générer des revenus passifs en USDT.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-bold px-10 py-4 rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all shadow-2xl shadow-emerald-500/30">
            Ouvrir mon compte gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="mt-6 text-xs text-gray-500">Inscription gratuite · Aucune carte requise · Commencez avec 69 USDT</div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#0a0d10]">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">InvestPro</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Plateforme d'investissement USDT TRC20 haute performance.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Plateforme</h4>
              <ul className="space-y-2.5">
                <li><Link href="/plans" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Plans d'investissement</Link></li>
                <li><Link href="/faq" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">FAQ</Link></li>
                <li><Link href="/register" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">S'inscrire</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Légal</h4>
              <ul className="space-y-2.5">
                <li><Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Conditions d'utilisation</Link></li>
                <li><Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Confidentialité</Link></li>
                <li><Link href="/aml" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Politique AML</Link></li>
                <li><Link href="/kyc-policy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Politique KYC</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Support</h4>
              <ul className="space-y-2.5">
                <li className="text-xs text-gray-500">support@investpro.com</li>
                <li className="text-xs text-gray-500">Disponible 24/7</li>
                <li><Link href="/login" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">→ Se connecter</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} InvestPro. Tous droits réservés.</p>
            <p className="text-xs text-gray-600">Les investissements comportent des risques.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
