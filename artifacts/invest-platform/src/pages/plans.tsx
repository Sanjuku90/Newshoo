import { Link } from "wouter";
import { useListPlans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, TrendingUp, Calculator } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const BADGES = ["🥉 Essai", "🔥 POPULAIRE", "👑 Elite"];
const SILVER_PITCH = "C'est le choix favori de notre communauté. Pour seulement 30 $ de plus que le pack de base, vous débloquez un boost de gains quotidiens et récupérez l'intégralité de votre investissement de départ en seulement 6 jours.";

function YieldCalculator({ plans }: { plans: any[] }) {
  const [amount, setAmount] = useState("200");

  const parsed = parseFloat(amount) || 0;

  return (
    <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">💰 Calculateur de rendement</h3>
          <p className="text-sm text-muted-foreground">Simulez vos gains avant d'investir</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-muted-foreground">Montant à investir (USDT)</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex : 200"
          />
          <span className="text-muted-foreground font-medium shrink-0">USDT</span>
        </div>
        <div className="flex gap-2 mt-3">
          {[69, 99, 299, 500, 1000].map(v => (
            <button key={v} onClick={() => setAmount(String(v))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${parseFloat(amount) === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"}`}>
              {v}$
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan, i) => {
          const minDep = parseFloat(String(plan.minDeposit));
          const eligible = parsed >= minDep;
          const effectiveAmount = eligible ? parsed : minDep;
          const dailyRate = parseFloat(String(plan.dailyRate));
          const dailyGain = effectiveAmount * dailyRate / 100;
          const totalGain = dailyGain * plan.durationDays;
          const roi = ((totalGain / effectiveAmount) * 100).toFixed(0);

          return (
            <div key={plan.id} className={`rounded-xl border p-4 transition-all ${eligible ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/20 opacity-60"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm">{plan.name}</span>
                {eligible
                  ? <Badge className="text-xs bg-accent/20 text-accent border-accent/30">Éligible ✓</Badge>
                  : <Badge variant="outline" className="text-xs text-muted-foreground">Min. {minDep}$</Badge>}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Par jour</span>
                  <span className="font-bold text-primary">+{dailyGain.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée</span>
                  <span className="font-medium">{plan.durationDays} jours</span>
                </div>
                <div className="border-t border-border/50 pt-2 flex justify-between">
                  <span className="text-muted-foreground font-medium">Total gagné</span>
                  <span className="font-bold text-lg text-accent">+{totalGain.toFixed(0)} $</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">ROI </span>
                  <span className="text-xs font-bold text-primary">{roi}%</span>
                </div>
              </div>
              {eligible && (
                <Link href="/register">
                  <Button size="sm" className="w-full mt-3" variant={i === 1 ? "default" : "outline"}>
                    Commencer
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {parsed > 0 && parsed < 69 && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          Le dépôt minimum est de <strong className="text-foreground">69 $</strong> pour accéder au Pack BRONZE.
        </p>
      )}
    </div>
  );
}

export default function Plans() {
  const { data: plans, isLoading } = useListPlans();

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">InvestPro</Link>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost" size="sm">Connexion</Button></Link>
            <Link href="/register"><Button size="sm">Commencer</Button></Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Haute Performance</Badge>
          <h1 className="text-4xl font-bold mb-4">🚀 Nos Plans d'Investissement</h1>
          <p className="text-muted-foreground text-lg">Des gains quotidiens en USD — dès la première minute</p>
        </div>

        {isLoading ? (
          <>
            <Skeleton className="h-64 mb-12" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[460px]" />)}
            </div>
          </>
        ) : (
          <>
            <YieldCalculator plans={plans || []} />

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {(plans || []).map((plan, i) => {
                const features: string[] = Array.isArray(plan.features)
                  ? plan.features as string[]
                  : JSON.parse((plan.features as unknown as string) || "[]");
                const dailyUSD = Math.round(parseFloat(String(plan.minDeposit)) * parseFloat(String(plan.dailyRate)) / 100);
                const totalUSD = dailyUSD * plan.durationDays;
                const isPopular = i === 1;

                return (
                  <Card key={plan.id} className={`relative border-border ${isPopular ? "border-primary/60 shadow-xl shadow-primary/10 scale-[1.02]" : ""}`}>
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold">⭐ Le plus populaire</Badge>
                      </div>
                    )}
                    <CardHeader className="pb-2 pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{BADGES[i]}</Badge>
                        <span className="text-xs text-muted-foreground">{plan.durationDays} jours</span>
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
                      <div className="pt-4 pb-1">
                        <div className="flex items-end gap-1">
                          <span className="text-5xl font-bold text-primary">{dailyUSD}</span>
                          <span className="text-2xl font-semibold text-primary mb-1">$</span>
                          <span className="text-muted-foreground text-base mb-1.5 ml-1">/ jour</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Dépôt requis</span>
                          <span className="font-bold text-base">{plan.minDeposit} $</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Durée du cycle</span>
                          <span className="font-medium">{plan.durationDays} jours</span>
                        </div>
                        <div className="border-t border-border/50 my-1" />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium">Retour total</span>
                          <span className="font-bold text-lg text-primary">{totalUSD} $</span>
                        </div>
                      </div>
                      <ul className="space-y-2.5">
                        {features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/register">
                        <Button className="w-full h-11 text-base" variant={isPopular ? "default" : "outline"}>
                          Commencer avec {plan.name}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="max-w-2xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center mb-12">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">⭐ Pourquoi choisir le Pack SILVER (99 $) ?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{SILVER_PITCH}</p>
            </div>
          </>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: "🏦", title: "Capital Zéro Risque", desc: "Vos fonds de dépôt et vos gains sont strictement séparés." },
            { icon: "⚡", title: "Retraits dès 9 $", desc: "Retirez vos gains à tout moment, 7j/7, dès 9 $ de solde." },
            { icon: "🤖", title: "Activation Auto", desc: "Le plan se lance instantanément à la confirmation du dépôt." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{icon}</div>
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Programme de Parrainage 3 Niveaux</h2>
          <p className="text-muted-foreground text-sm mb-2">Invitez des amis et gagnez des commissions automatiques sur 3 niveaux :</p>
          <div className="flex justify-center gap-8 my-4 text-sm">
            <div><span className="text-2xl font-bold text-primary">5%</span><br /><span className="text-muted-foreground">Niveau 1</span></div>
            <div><span className="text-2xl font-bold text-primary">3%</span><br /><span className="text-muted-foreground">Niveau 2</span></div>
            <div><span className="text-2xl font-bold text-primary">1%</span><br /><span className="text-muted-foreground">Niveau 3</span></div>
          </div>
          <Link href="/register">
            <Button variant="outline" className="mt-2">Rejoindre & Parrainer</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
