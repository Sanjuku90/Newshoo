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
              <>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Rejoins InvestPro et gagne jusqu'à 36$/jour en USDT ! 🚀\n${referralLink}`)}`}
                  target="_blank" rel="noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Rejoins InvestPro et gagne jusqu'à 36$/jour en USDT ! 🚀")}`}
                  target="_blank" rel="noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#229ED9]/40 bg-[#229ED9]/10 text-[#229ED9] text-xs font-medium hover:bg-[#229ED9]/20 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
              </>
            )}
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

      {/* Referral Visual Tree */}
      {r?.referrals && r.referrals.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Arbre de parrainage</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Root node */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-5 py-2.5">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {u?.firstName?.[0]}{u?.lastName?.[0]}
                </div>
                <span className="text-sm font-semibold text-primary">Vous</span>
              </div>
              <div className="w-px h-6 bg-border" />
            </div>

            {/* Levels */}
            {[1, 2, 3].map(level => {
              const levelRefs = r.referrals.filter((ref: any) => ref.level === level);
              if (levelRefs.length === 0) return null;
              const levelColors: Record<number, { border: string; text: string; badge: string }> = {
                1: { border: "border-primary/40 bg-primary/5", text: "text-primary", badge: "bg-primary/20 text-primary" },
                2: { border: "border-accent/40 bg-accent/5", text: "text-accent", badge: "bg-accent/20 text-accent" },
                3: { border: "border-yellow-500/40 bg-yellow-500/5", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-400" },
              };
              const col = levelColors[level];
              return (
                <div key={level} className="mb-4">
                  <div className="flex items-center gap-2 mb-3 pl-2">
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.badge}`}>Niveau {level}</div>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">{levelRefs.length} filleul{levelRefs.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className={`ml-${level === 1 ? "0" : level === 2 ? "4" : "8"} space-y-2`}>
                    {levelRefs.map((ref: any) => (
                      <div key={ref.id} className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${col.border}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full border-2 ${col.border} flex items-center justify-center text-[11px] font-bold ${col.text}`}>
                            {ref.name?.[0] || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{ref.name}</div>
                            <div className="text-xs text-muted-foreground">{new Date(ref.joinedAt).toLocaleDateString("fr-FR")}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {ref.totalInvested > 0 ? (
                            <span className="text-xs font-semibold text-accent">✓ {ref.totalInvested} USDT</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Inactif</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {level < 3 && r.referrals.some((ref: any) => ref.level === level + 1) && (
                    <div className="flex justify-center mt-3"><div className="w-px h-6 bg-border" /></div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
