import { useState } from "react";
import { useGetMe, useUpdateProfile, useGetKycStatus, useSubmitKyc } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { data: user, refetch } = useGetMe();
  const { data: kyc } = useGetKycStatus();
  const updateProfile = useUpdateProfile();
  const submitKyc = useSubmitKyc();
  const { toast } = useToast();

  const u = user as any;
  const k = kyc as any;

  const [profileForm, setProfileForm] = useState({ phone: u?.phone || "", country: u?.country || "", city: u?.city || "", newPassword: "" });
  const [kycForm, setKycForm] = useState({ documentType: "passport", documentNumber: "", documentFront: "", documentBack: "", selfie: "" });
  const [profileError, setProfileError] = useState("");
  const [kycError, setKycError] = useState("");

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    updateProfile.mutate(
      { data: { phone: profileForm.phone, country: profileForm.country, city: profileForm.city, ...(profileForm.newPassword ? { password: profileForm.newPassword } : {}) } as any },
      {
        onSuccess: () => {
          toast({ title: "Profil mis à jour !" });
          refetch();
        },
        onError: (err: any) => setProfileError(err?.data?.error || "Échec de la mise à jour"),
      }
    );
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKycError("");
    submitKyc.mutate(
      { data: { documentType: kycForm.documentType, documentNumber: kycForm.documentNumber, documentFrontUrl: kycForm.documentFront, documentBackUrl: kycForm.documentBack, selfieUrl: kycForm.selfie } as any },
      {
        onSuccess: () => {
          toast({ title: "KYC soumis !", description: "Vos documents sont en cours de vérification." });
        },
        onError: (err: any) => setKycError(err?.data?.error || "Échec de l'envoi du KYC"),
      }
    );
  };

  const kycStatusConfig: Record<string, { label: string; icon: any; class: string }> = {
    not_submitted: { label: "Non soumis",        icon: AlertCircle,  class: "bg-secondary text-muted-foreground border-border" },
    pending:       { label: "En cours d'examen", icon: Clock,        class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    approved:      { label: "Vérifié",           icon: CheckCircle2, class: "bg-accent/20 text-accent border-accent/30" },
    rejected:      { label: "Rejeté",            icon: AlertCircle,  class: "bg-destructive/20 text-destructive border-destructive/30" },
  };

  const kycStatus = k?.status || u?.kycStatus || "not_submitted";
  const kycConf = kycStatusConfig[kycStatus] || kycStatusConfig.not_submitted;
  const KycIcon = kycConf.icon;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Profil</h1>
        <p className="text-muted-foreground text-sm">Gérez vos paramètres de compte et la vérification KYC</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
            {u?.firstName?.[0]}{u?.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold">{u?.firstName} {u?.lastName}</div>
            <div className="text-sm text-muted-foreground">{u?.email}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-xs border ${kycConf.class}`}><KycIcon className="h-3 w-3 mr-1" />KYC : {kycConf.label}</Badge>
              <Badge variant="secondary" className="text-xs">Niveau VIP {u?.vipLevel || 1}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Code de parrainage</div>
            <div className="font-mono font-semibold text-primary">{u?.referralCode}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="profile">Informations personnelles</TabsTrigger>
          <TabsTrigger value="kyc"><Shield className="h-4 w-4 mr-1" />Vérification KYC</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Modifier le profil</CardTitle>
            </CardHeader>
            <CardContent>
              {profileError && (
                <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />{profileError}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input value={u?.firstName || ""} disabled className="opacity-60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input value={u?.lastName || ""} disabled className="opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={u?.email || ""} disabled className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1234567890" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pays</Label>
                    <Input value={profileForm.country} onChange={e => setProfileForm(p => ({ ...p, country: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input value={profileForm.city} onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nouveau mot de passe (optionnel)</Label>
                  <Input type="password" value={profileForm.newPassword} onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Laisser vide pour ne pas changer" />
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Vérification KYC</CardTitle>
            </CardHeader>
            <CardContent>
              {kycStatus === "approved" ? (
                <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                  <div>
                    <div className="font-semibold text-accent">Identité vérifiée</div>
                    <div className="text-sm text-muted-foreground">Votre KYC a été approuvé. Vous avez un accès complet à la plateforme.</div>
                  </div>
                </div>
              ) : kycStatus === "pending" ? (
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-400" />
                  <div>
                    <div className="font-semibold text-yellow-400">En cours d'examen</div>
                    <div className="text-sm text-muted-foreground">Vos documents sont en cours de vérification. Comptez généralement 24 à 48 heures.</div>
                  </div>
                </div>
              ) : (
                <>
                  {kycStatus === "rejected" && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Votre KYC précédent a été rejeté. Veuillez le soumettre à nouveau.
                      {k?.rejectionReason && <span className="ml-1">Raison : {k.rejectionReason}</span>}
                    </div>
                  )}
                  {kycError && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                      <AlertCircle className="h-4 w-4 shrink-0" />{kycError}
                    </div>
                  )}
                  <form onSubmit={handleKycSubmit} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label>Type de document</Label>
                      <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground" value={kycForm.documentType} onChange={e => setKycForm(p => ({ ...p, documentType: e.target.value }))}>
                        <option value="passport">Passeport</option>
                        <option value="id_card">Carte d'identité nationale</option>
                        <option value="driver_license">Permis de conduire</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Numéro de document</Label>
                      <Input placeholder="Numéro de document" value={kycForm.documentNumber} onChange={e => setKycForm(p => ({ ...p, documentNumber: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>URL recto du document</Label>
                      <Input placeholder="https://..." value={kycForm.documentFront} onChange={e => setKycForm(p => ({ ...p, documentFront: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>URL verso du document</Label>
                      <Input placeholder="https://..." value={kycForm.documentBack} onChange={e => setKycForm(p => ({ ...p, documentBack: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>URL selfie avec document</Label>
                      <Input placeholder="https://..." value={kycForm.selfie} onChange={e => setKycForm(p => ({ ...p, selfie: e.target.value }))} required />
                    </div>
                    <Button type="submit" disabled={submitKyc.isPending}>
                      {submitKyc.isPending ? "Envoi..." : "Soumettre les documents"}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
