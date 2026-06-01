import { Link } from "wouter";
import { useListPlans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";

const FALLBACK_PLANS = [
  {
    id: "1",
    name: "Pack BRONZE",
    description: "Idéal pour tester la plateforme",
    minDeposit: "69",
    maxDeposit: "98",
    dailyRate: "14.4928",
    durationDays: 15,
    features: ["10 $ de gain par jour", "Retour total : 150 $ en 15 jours", "Capital récupéré dès le 7e jour", "Retrait dès 9 $ de solde"],
  },
  {
    id: "2",
    name: "Pack SILVER",
    description: "Le meilleur ratio de rentabilité",
    minDeposit: "99",
    maxDeposit: "198",
    dailyRate: "17.1717",
    durationDays: 15,
    features: ["17 $ de gain par jour", "Retour total : 255 $ en 15 jours", "Capital récupéré en 6 jours", "Retrait dès 9 $ de solde"],
  },
  {
    id: "3",
    name: "Pack GOLD",
    description: "Revenus maximaux garantis",
    minDeposit: "199",
    maxDeposit: null,
    dailyRate: "18.0905",
    durationDays: 15,
    features: ["36 $ de gain par jour", "Retour total : 540 $ en 15 jours", "Capital récupéré dès le 6e jour", "Retrait dès 9 $ de solde"],
  },
];

const BADGES = ["🥉 Essai", "🔥 POPULAIRE", "👑 Elite"];

export default function Home() {
  const { data: plansData } = useListPlans();
  const plans = (plansData && plansData.length > 0 ? plansData : FALLBACK_PLANS) as typeof FALLBACK_PLANS;

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">InvestPro</span>
          <div className="flex items-center gap-4">
            <Link href="/plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Plans</Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Commencer</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">
          Plateforme d'investissement USDT TRC20
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Faites Fructifier<br />
          <span className="text-primary">Votre Capital</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Jusqu'à <strong className="text-primary">36 $ de gains par jour</strong> sur vos investissements USDT.
          Sécurisé, transparent et professionnel.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="px-8">
              Commencer à investir <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/plans">
            <Button size="lg" variant="outline" className="px-8">Voir les plans</Button>
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card/30">
        <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Gains max.", value: "36 $/jour" },
            { label: "Dépôt minimum", value: "69 USDT" },
            { label: "Niveaux parrainage", value: "3 niveaux" },
            { label: "Frais de retrait", value: "2% seulement" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos Plans d'Investissement</h2>
          <p className="text-muted-foreground">Choisissez votre pack — des gains quotidiens dès le 1er jour</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const features: string[] = Array.isArray(plan.features)
              ? plan.features as string[]
              : JSON.parse((plan.features as string) || "[]");
            const dailyUSD = Math.round(parseFloat(plan.minDeposit) * parseFloat(String(plan.dailyRate)) / 100);
            const totalUSD = dailyUSD * plan.durationDays;
            const isPopular = i === 1;
            return (
              <Card key={plan.id} className={`border-border relative ${isPopular ? "border-primary/60 shadow-lg shadow-primary/10" : ""}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">🔥 Le plus populaire</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs text-muted-foreground">{BADGES[i]}</Badge>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="pt-3">
                    <span className="text-4xl font-bold text-primary">{dailyUSD} $</span>
                    <span className="text-muted-foreground text-sm"> / jour</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dépôt</span>
                      <span className="font-semibold">{plan.minDeposit} $</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durée</span>
                      <span className="font-semibold">{plan.durationDays} jours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retour total</span>
                      <span className="font-semibold text-primary">{totalUSD} $</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full" variant={isPopular ? "default" : "outline"}>
                      Commencer avec {plan.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-16 bg-card/20 rounded-2xl max-w-5xl mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">🔒 Sécurité & Gestion des Fonds</h2>
          <p className="text-muted-foreground text-sm">Une architecture financière pensée pour votre sérénité</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🏦", title: "Zéro Risque sur le Capital", desc: "Vos fonds de dépôt et vos gains sont strictement séparés. Votre capital ne peut jamais être bloqué par vos retraits." },
            { icon: "⚡", title: "Retraits Instantanés", desc: "Dès que votre solde de gains atteint 9 $, vous pouvez retirer votre argent immédiatement, 7j/7." },
            { icon: "🤖", title: "Activation Automatique", desc: "Le système détecte le montant de votre dépôt et active instantanément le plan correspondant." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold mb-2 text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 border-t border-border">
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Shield, title: "Sécurisé", desc: "Dépôts et retraits via blockchain USDT TRC20" },
            { icon: TrendingUp, title: "Profits quotidiens", desc: "Bénéfices crédités sur votre compte chaque jour" },
            { icon: Users, title: "Parrainage 3 niveaux", desc: "Gagnez des commissions sur 3 niveaux de filleuls" },
            { icon: Zap, title: "Retraits rapides", desc: "Retirez vos gains avec seulement 2% de frais" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card/30 py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold text-primary mb-3">InvestPro</div>
              <p className="text-sm text-muted-foreground">Plateforme d'investissement USDT TRC20 haute performance.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Plateforme</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <Link href="/plans" className="block hover:text-foreground transition-colors">Plans d'investissement</Link>
                <Link href="/faq" className="block hover:text-foreground transition-colors">FAQ</Link>
                <Link href="/register" className="block hover:text-foreground transition-colors">Inscription</Link>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <Link href="/terms" className="block hover:text-foreground transition-colors">Conditions d'utilisation</Link>
                <Link href="/privacy" className="block hover:text-foreground transition-colors">Politique de confidentialité</Link>
                <Link href="/aml" className="block hover:text-foreground transition-colors">Politique AML</Link>
                <Link href="/kyc-policy" className="block hover:text-foreground transition-colors">Politique KYC</Link>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@investpro.com</li>
                <li>Disponible 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © 2024 InvestPro. Tous droits réservés. Les investissements comportent des risques.
          </div>
        </div>
      </footer>
    </div>
  );
}
