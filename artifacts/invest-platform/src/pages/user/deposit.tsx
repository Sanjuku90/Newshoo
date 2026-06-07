import { useState, useEffect } from "react";
import { useListDeposits, useCreateDeposit } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Copy, CheckCircle2, Clock, XCircle, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const statusConfig: Record<string, { label: string; icon: any; class: string }> = {
  pending: { label: "En attente", icon: Clock, class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved: { label: "Approuvé", icon: CheckCircle2, class: "bg-accent/20 text-accent border-accent/30" },
  rejected: { label: "Rejeté", icon: XCircle, class: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function Deposit() {
  const { data: deposits, isLoading, refetch } = useListDeposits();
  const createDeposit = useCreateDeposit();
  const { toast } = useToast();

  const [form, setForm] = useState({ amount: "", txHash: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [minDeposit, setMinDeposit] = useState(69);

  useEffect(() => {
    fetch("/api/settings/public")
      .then(r => r.json())
      .then(s => {
        if (s.deposit_wallet) setWalletAddress(s.deposit_wallet);
        if (s.min_deposit) setMinDeposit(parseFloat(s.min_deposit));
      })
      .catch(() => {});
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié !", description: "Adresse copiée dans le presse-papiers" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createDeposit.mutate(
      { data: { amount: parseFloat(form.amount), txHash: form.txHash } },
      {
        onSuccess: () => {
          toast({ title: "Dépôt soumis !", description: "Votre dépôt est en attente de vérification." });
          setForm({ amount: "", txHash: "" });
          refetch();
        },
        onError: (err: any) => setError(err?.data?.error || "Échec de la soumission"),
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dépôt</h1>
        <p className="text-muted-foreground text-sm">Envoyez des USDT TRC20 à l'adresse ci-dessous et soumettez votre transaction</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Étape 1 : Envoyer USDT TRC20</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Adresse du portefeuille</div>
              {walletAddress ? (
                <div className="font-mono text-sm break-all text-foreground mb-3">{walletAddress}</div>
              ) : (
                <Skeleton className="h-5 w-full mb-3" />
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2" disabled={!walletAddress}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copié !" : "Copier"}
                </Button>

                {walletAddress && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <QrCode className="h-4 w-4" /> QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="dark bg-card border-border flex flex-col items-center gap-6 py-8 max-w-xs">
                      <DialogHeader>
                        <DialogTitle className="text-center">Scanner pour déposer</DialogTitle>
                      </DialogHeader>
                      <div className="bg-white p-4 rounded-xl shadow-lg">
                        <QRCodeSVG value={walletAddress} size={220} level="H" />
                      </div>
                      <div className="text-center px-4 w-full">
                        <p className="text-xs text-muted-foreground mb-2">Réseau : <strong className="text-yellow-400">TRC20 uniquement</strong></p>
                        <p className="font-mono text-xs text-muted-foreground break-all">{walletAddress}</p>
                      </div>
                      <Button onClick={handleCopy} className="gap-2 w-full max-w-xs">
                        <Copy className="h-4 w-4" /> Copier l'adresse
                      </Button>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-yellow-400" />
                <span>Envoyez <strong className="text-foreground">uniquement des USDT sur le réseau TRC20</strong>. Tout autre réseau entraîne une perte définitive des fonds.</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>Dépôt minimum : <strong className="text-foreground">{minDeposit} USDT</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Étape 2 : Soumettre la transaction</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Montant (USDT)</Label>
                <Input type="number" min={minDeposit} step="0.01" placeholder={`Minimum ${minDeposit} USDT`}
                  value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Hash de transaction (TxID)</Label>
                <Input placeholder="Entrez l'identifiant de transaction TRC20"
                  value={form.txHash} onChange={e => setForm(prev => ({ ...prev, txHash: e.target.value }))} required />
                <p className="text-xs text-muted-foreground">Trouvez le TxID dans votre portefeuille après l'envoi</p>
              </div>
              <Button type="submit" className="w-full" disabled={createDeposit.isPending}>
                {createDeposit.isPending ? "Envoi en cours..." : "Soumettre le dépôt"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Historique des dépôts</h2>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : deposits && (deposits as any[]).length > 0 ? (
          <div className="space-y-3">
            {(deposits as any[]).map((dep) => {
              const conf = statusConfig[dep.status] || statusConfig.pending;
              const Icon = conf.icon;
              return (
                <Card key={dep.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dep.amount} USDT</span>
                        <Badge className={`text-xs border ${conf.class}`}><Icon className="h-3 w-3 mr-1" />{conf.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate max-w-xs">{dep.txHash}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(dep.createdAt).toLocaleDateString("fr-FR")}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="py-12 text-center text-muted-foreground">Aucun dépôt pour l'instant</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
