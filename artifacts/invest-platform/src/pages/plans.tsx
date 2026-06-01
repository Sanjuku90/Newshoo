import { Link } from "wouter";
import { useListPlans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Plans() {
  const { data: plans, isLoading } = useListPlans();

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">InvestPro</Link>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Investment Plans</h1>
          <p className="text-muted-foreground text-lg">Choose the plan that matches your investment capacity</p>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1,2,3].map(i => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(plans || []).map((plan, i) => {
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
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-4xl font-bold text-primary">{plan.dailyRate}%</span>
                      <span className="text-muted-foreground"> / day</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-secondary/50 rounded-lg p-3 space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Minimum</span><span className="font-medium">{plan.minDeposit} USDT</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Maximum</span><span className="font-medium">{plan.maxDeposit ? plan.maxDeposit + " USDT" : "Unlimited"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{plan.durationDays} days</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Total Return</span><span className="font-medium text-accent">{(parseFloat(plan.dailyRate) * plan.durationDays).toFixed(0)}%</span></div>
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
                        Start with {plan.name}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        <div className="mt-16 max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Referral Program</h2>
          <p className="text-muted-foreground text-sm mb-4">Earn commissions on 3 levels: Level 1 (5%), Level 2 (3%), Level 3 (1%)</p>
          <Link href="/register"><Button variant="outline">Join & Refer Friends</Button></Link>
        </div>
      </div>
    </div>
  );
}
