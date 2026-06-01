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
      { data: { phone: profileForm.phone, country: profileForm.country, city: profileForm.city, ...(profileForm.newPassword ? { password: profileForm.newPassword } : {}) } },
      {
        onSuccess: () => {
          toast({ title: "Profile updated!" });
          refetch();
        },
        onError: (err: any) => setProfileError(err?.data?.error || "Failed to update"),
      }
    );
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKycError("");
    submitKyc.mutate(
      { data: { documentType: kycForm.documentType, documentNumber: kycForm.documentNumber, documentFrontUrl: kycForm.documentFront, documentBackUrl: kycForm.documentBack, selfieUrl: kycForm.selfie } },
      {
        onSuccess: () => {
          toast({ title: "KYC submitted!", description: "Your documents are under review." });
        },
        onError: (err: any) => setKycError(err?.data?.error || "Failed to submit KYC"),
      }
    );
  };

  const kycStatusConfig: Record<string, { label: string; icon: any; class: string }> = {
    not_submitted: { label: "Not Submitted", icon: AlertCircle, class: "bg-secondary text-muted-foreground border-border" },
    pending: { label: "Under Review", icon: Clock, class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    approved: { label: "Verified", icon: CheckCircle2, class: "bg-accent/20 text-accent border-accent/30" },
    rejected: { label: "Rejected", icon: AlertCircle, class: "bg-destructive/20 text-destructive border-destructive/30" },
  };

  const kycStatus = k?.status || u?.kycStatus || "not_submitted";
  const kycConf = kycStatusConfig[kycStatus] || kycStatusConfig.not_submitted;
  const KycIcon = kycConf.icon;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your account settings and KYC verification</p>
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
              <Badge className={`text-xs border ${kycConf.class}`}><KycIcon className="h-3 w-3 mr-1" />KYC: {kycConf.label}</Badge>
              <Badge variant="secondary" className="text-xs">VIP Level {u?.vipLevel || 1}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Referral Code</div>
            <div className="font-mono font-semibold text-primary">{u?.referralCode}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="kyc"><Shield className="h-4 w-4 mr-1" />KYC Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Update Profile</CardTitle>
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
                    <Label>First Name</Label>
                    <Input value={u?.firstName || ""} disabled className="opacity-60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={u?.lastName || ""} disabled className="opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={u?.email || ""} disabled className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1234567890" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={profileForm.country} onChange={e => setProfileForm(p => ({ ...p, country: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={profileForm.city} onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password (optional)</Label>
                  <Input type="password" value={profileForm.newPassword} onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Leave blank to keep current" />
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">KYC Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {kycStatus === "approved" ? (
                <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                  <div>
                    <div className="font-semibold text-accent">Identity Verified</div>
                    <div className="text-sm text-muted-foreground">Your KYC has been approved. You have full platform access.</div>
                  </div>
                </div>
              ) : kycStatus === "pending" ? (
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-400" />
                  <div>
                    <div className="font-semibold text-yellow-400">Under Review</div>
                    <div className="text-sm text-muted-foreground">Your documents are being verified. This usually takes 24–48 hours.</div>
                  </div>
                </div>
              ) : (
                <>
                  {kycStatus === "rejected" && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Your previous KYC was rejected. Please resubmit.
                      {k?.rejectionReason && <span className="ml-1">Reason: {k.rejectionReason}</span>}
                    </div>
                  )}
                  {kycError && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                      <AlertCircle className="h-4 w-4 shrink-0" />{kycError}
                    </div>
                  )}
                  <form onSubmit={handleKycSubmit} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground" value={kycForm.documentType} onChange={e => setKycForm(p => ({ ...p, documentType: e.target.value }))}>
                        <option value="passport">Passport</option>
                        <option value="id_card">National ID Card</option>
                        <option value="driver_license">Driver's License</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Document Number</Label>
                      <Input placeholder="Document number" value={kycForm.documentNumber} onChange={e => setKycForm(p => ({ ...p, documentNumber: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Document Front URL</Label>
                      <Input placeholder="https://..." value={kycForm.documentFront} onChange={e => setKycForm(p => ({ ...p, documentFront: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Document Back URL</Label>
                      <Input placeholder="https://..." value={kycForm.documentBack} onChange={e => setKycForm(p => ({ ...p, documentBack: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Selfie with Document URL</Label>
                      <Input placeholder="https://..." value={kycForm.selfie} onChange={e => setKycForm(p => ({ ...p, selfie: e.target.value }))} required />
                    </div>
                    <Button type="submit" disabled={submitKyc.isPending}>
                      {submitKyc.isPending ? "Submitting..." : "Submit Documents"}
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
