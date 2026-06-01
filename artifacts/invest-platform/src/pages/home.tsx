import { Link } from "wouter";
import { useListPlans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";

export default function Home() {
  const { data: plans } = useListPlans();

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

      <section className="container mx-auto px-4 py-24 text-center">
        <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">
          Plateforme d'investissement USDT TRC20
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Faites Fructifier<br />
          <span className="text-primary">Votre Capital</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Jusqu'à 4% de rendement journalier sur vos investissements USDT. Sécurisé, transparent et professionnel.
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

      <section className="border-y border-border bg-card/30">
        <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Rendement max.", value: "4%/jour" },
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

      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Plans d'investissement</h2>
          <p className="text-muted-foreground">Choisissez le plan adapté à votre capacité d'investissement</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(plans || [
            { id: "1", name: "STARTER", minDeposit: "69", maxDeposit: "98", dailyRate: "1.5", durationDays: 30, features: ["Profit journalier", "Retrait des bénéfices autorisé", "Support standard", "Accès tableau de bord"] },
            { id: "2", name: "PREMIUM", minDeposit: "99", maxDeposit: "198", dailyRate: "2.5", durationDays: 30, features: ["Profit journalier élevé", "Bonus supplémentaire", "Support prioritaire", "Rapports avancés"] },
            { id: "3", name: "VIP", minDeposit: "199", maxDeposit: null, dailyRate: "4.0", durationDays: 30, features: ["Profit VIP maximum", "Support dédié 24/7", "Bonus exclusifs", "Accès VIP complet"] },
          ]).map((plan, i) => {
            const features: string[] = Array.isArray(plan.features)
              ? plan.features as string[]
              : JSON.parse((plan.features as string) || "[]");
            return (
              <Card key={plan.id} className={`border-border ${i === 1 ? 'border-primary/50 relative' : ''}`}>
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Le plus populaire</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-primary">{plan.dailyRate}%</span>
                    <span className="text-muted-foreground"> / jour</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {plan.minDeposit} – {plan.maxDeposit ? plan.maxDeposit : "∞"} USDT · {plan.durationDays} jours
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
                    <Button className="w-full" variant={i === 1 ? "default" : "outline"}>
                      Commencer
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

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
              <div className="text-lg font-bold text-primary mb-3">InvestPro</div>
              <p className="text-sm text-muted-foreground">Plateforme d'investissement USDT TRC20 sécurisée et transparente.</p>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground mb-3">Plateforme</div>
              <div className="space-y-2">
                <Link href="/plans" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Plans d'investissement</Link>
                <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
                <Link href="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Inscription</Link>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground mb-3">Légal</div>
              <div className="space-y-2">
                <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Conditions d'utilisation</Link>
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Politique de confidentialité</Link>
                <Link href="/aml" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Politique AML</Link>
                <Link href="/kyc-policy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Politique KYC</Link>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground mb-3">Support</div>
              <div className="space-y-2">
                <Link href="/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Connexion</Link>
                <Link href="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Créer un compte</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © 2025 InvestPro. Tous droits réservés. Dépôts via USDT TRC20 uniquement.
          </div>
        </div>
      </footer>
    </div>
  );
}
