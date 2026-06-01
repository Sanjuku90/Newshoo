import { useListReferrals, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle2, Users, TrendingUp, QrCode, Gift } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Referrals() {
  const { data: user } = useGetMe();
  const { data: referrals, isLoading } = useListReferrals();
  const { toast } = useToast();
  const { token } = useAuth() as any;
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);

  const u = user as any;
  const referralLink = u?.referralCode
    ? `${window.location.origin}/register?ref=${u.referralCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Lien copié !", description: "Lien de parrainage copié dans le presse-papiers" });
  };

  const promoMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/promo-codes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Code promo appliqué !", description: data.message });
      setPromoCode("");
      setPromoOpen(false);
      qc.invalidateQueries({ queryKey: ["getMe"] });
      qc.invalidateQueries({ queryKey: ["getDashboardSummary"] });
    },
    onError: (e: any) => {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    },
  });

  const levelConfig = [
    { level: 1, rate: "10%", color: "text-primary" },
    { level: 2, rate: "5%", color: "text-accent" },
    { level: 3, rate: "2%", color: "text-yellow-400" },
  ];

  const r = referrals as any;

  const LEADER_MILESTONES = [
    { count: 10, bonus: "25 USDT" },
    { count: 50, bonus: "150 USDT" },
    { count: 100, bonus: "500 USDT" },
    { count: 500, bonus: "5 000 USDT" },
  ];

  const activeRefs = r?.activeReferrals ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Programme de Parrainage</h1>
        <p className="text-muted-foreground text-sm">Gagnez des commissions sur 3 niveaux de filleuls</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {levelConfig.map(({ level, rate, color }) => (
          <Card key={level} className="border-border text-center">
            <CardContent className="p-5">
              <div className={`text-2xl font-bold ${color} mb-1`}>{rate}</div>
              <div className="text-xs text-muted-foreground">Niveau {level}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Votre lien de parrainage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 font-mono text-sm text-muted-foreground truncate">
              {referralLink || "Chargement..."}
            </div>
            <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2 shrink-0">
              {copied ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copié !" : "Copier"}
            </Button>
            {referralLink && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0">
                    <QrCode className="h-4 w-4" /> QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark bg-card border-border flex flex-col items-center gap-6 py-8">
                  <DialogHeader>
                    <DialogTitle className="text-center">QR Code de parrainage</DialogTitle>
                  </DialogHeader>
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG value={referralLink} size={220} level="H" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Code parrain</p>
                    <code className="text-lg font-bold text-primary">{u?.referralCode}</code>
                  </div>
                  <Button onClick={handleCopy} className="gap-2 w-full max-w-xs">
                    <Copy className="h-4 w-4" /> Copier le lien
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {u?.referralCode && (
            <p className="text-xs text-muted-foreground">Code : <span className="text-primary font-semibold">{u.referralCode}</span></p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Gift className="h-4 w-4 text-primary" /> Code Promo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Entrez votre code promo"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              className="uppercase font-mono"
            />
            <Button
              onClick={() => promoMutation.mutate(promoCode)}
              disabled={!promoCode || promoMutation.isPending}
              className="shrink-0"
            >
              {promoMutation.isPending ? "..." : "Appliquer"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Le bonus sera crédité sur votre solde bonus</p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Bonus de Leader</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LEADER_MILESTONES.map(({ count, bonus }) => {
              const reached = activeRefs >= count;
              return (
                <div key={count} className={`rounded-lg border p-3 text-center transition-all ${reached ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                  <div className={`text-lg font-bold mb-0.5 ${reached ? "text-primary" : "text-muted-foreground"}`}>{bonus}</div>
                  <div className="text-xs text-muted-foreground">{count} filleuls actifs</div>
                  {reached && <Badge variant="outline" className="mt-1.5 text-xs text-green-400 border-green-500/30">Atteint ✓</Badge>}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Filleuls actifs actuellement : <span className="text-foreground font-medium">{activeRefs}</span>
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : r && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Réseau</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map(level => (
                <div key={level} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">Niveau {level}</span>
                  <Badge variant="secondary">{r[`level${level}Count`] || 0} filleuls</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Commissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-primary">
                {parseFloat(r.totalCommissions || "0").toFixed(2)} USDT
              </div>
              <p className="text-sm text-muted-foreground">Total gagné en commissions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {r?.referrals && r.referrals.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Mes filleuls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {r.referrals.map((ref: any) => (
                <div key={ref.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-medium">{ref.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(ref.joinedAt).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">Niveau {ref.level}</Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ref.totalInvested > 0 ? (
                        <span className="text-accent">Actif · {ref.totalInvested} USDT</span>
                      ) : "Inactif"}
                    </div>
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
