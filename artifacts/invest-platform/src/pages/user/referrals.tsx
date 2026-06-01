import { useListReferrals, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Referrals() {
  const { data: user } = useGetMe();
  const { data: referrals, isLoading } = useListReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const u = user as any;
  const referralLink = u?.referralCode
    ? `${window.location.origin}/register?ref=${u.referralCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
  };

  const levelConfig = [
    { level: 1, rate: "5%", color: "text-primary" },
    { level: 2, rate: "3%", color: "text-accent" },
    { level: 3, rate: "1%", color: "text-yellow-400" },
  ];

  const r = referrals as any;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Referral Program</h1>
        <p className="text-muted-foreground text-sm">Earn commissions on 3 levels of referrals</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {levelConfig.map(({ level, rate, color }) => (
          <Card key={level} className="border-border text-center">
            <CardContent className="p-5">
              <div className={`text-2xl font-bold ${color} mb-1`}>{rate}</div>
              <div className="text-xs text-muted-foreground">Level {level} Commission</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 font-mono text-sm text-muted-foreground truncate">
              {referralLink || "Loading..."}
            </div>
            <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2 shrink-0">
              {copied ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {u?.referralCode && (
            <p className="text-xs text-muted-foreground">Your referral code: <span className="text-primary font-semibold">{u.referralCode}</span></p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : r && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Network Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map(level => (
                <div key={level} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">Level {level} referrals</span>
                  <Badge variant="secondary">{r[`level${level}Count`] || 0} users</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Earnings Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-primary">
                {parseFloat(r.totalCommissions || "0").toFixed(2)} USDT
              </div>
              <p className="text-sm text-muted-foreground">Total commissions earned</p>
              <div className="space-y-2 pt-2">
                {[1, 2, 3].map(level => (
                  <div key={level} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level {level}</span>
                    <span className="font-medium">{parseFloat(r[`level${level}Commissions`] || "0").toFixed(2)} USDT</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {r?.referrals && r.referrals.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {r.referrals.map((ref: any) => (
                <div key={ref.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-medium">{ref.firstName} {ref.lastName}</div>
                    <div className="text-xs text-muted-foreground">{new Date(ref.joinedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">Level {ref.level}</Badge>
                    <div className="text-xs text-accent mt-1">+{parseFloat(ref.commission || "0").toFixed(2)} USDT</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
