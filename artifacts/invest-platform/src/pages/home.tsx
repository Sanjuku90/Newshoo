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
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-24 text-center">
        <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">
          USDT TRC20 Investment Platform
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Grow Your Wealth<br />
          <span className="text-primary">Every Day</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Earn up to 3% daily returns on your USDT investments. Secure, transparent, and professional crypto investment management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="px-8">
              Start Investing <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/plans">
            <Button size="lg" variant="outline" className="px-8">View Plans</Button>
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Daily Returns", value: "Up to 3%" },
            { label: "Min. Deposit", value: "69 USDT" },
            { label: "Referral Levels", value: "3 Levels" },
            { label: "Withdrawal Fee", value: "2% only" },
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
          <h2 className="text-3xl font-bold mb-4">Investment Plans</h2>
          <p className="text-muted-foreground">Choose the plan that fits your investment goals</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(plans || [
            { id: "1", name: "Starter", minDeposit: "69", maxDeposit: "98", dailyRate: "1.5", durationDays: 30, features: ["Daily profit distribution", "24/7 monitoring", "Withdrawal at maturity", "Email support"] },
            { id: "2", name: "Premium", minDeposit: "99", maxDeposit: "198", dailyRate: "2.2", durationDays: 30, features: ["Higher daily returns", "Priority email support", "Bonus on referrals", "Monthly profit boost"] },
            { id: "3", name: "VIP", minDeposit: "199", maxDeposit: null, dailyRate: "3.0", durationDays: 30, features: ["Maximum daily returns", "Dedicated account manager", "Priority KYC processing", "VIP support line"] },
          ]).map((plan, i) => {
            const features: string[] = Array.isArray(plan.features)
              ? plan.features as string[]
              : JSON.parse((plan.features as string) || "[]");
            return (
              <Card key={plan.id} className={`border-border ${i === 1 ? 'border-primary/50 relative' : ''}`}>
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-primary">{plan.dailyRate}%</span>
                    <span className="text-muted-foreground"> / day</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {plan.minDeposit} – {plan.maxDeposit ? plan.maxDeposit : "∞"} USDT · {plan.durationDays} days
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
                      Get Started
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
            { icon: Shield, title: "Secure", desc: "USDT TRC20 blockchain-based deposits and withdrawals" },
            { icon: TrendingUp, title: "Daily Returns", desc: "Profits credited to your account every single day" },
            { icon: Users, title: "3-Level Referrals", desc: "Earn commissions on 3 levels of your referral network" },
            { icon: Zap, title: "Fast Withdrawals", desc: "Withdraw your earnings with only a 2% processing fee" },
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

      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 InvestPro. All rights reserved. Deposits via USDT TRC20 only.
        </div>
      </footer>
    </div>
  );
}
