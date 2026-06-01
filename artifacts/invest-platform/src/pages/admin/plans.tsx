import { useState } from "react";
import { useListPlans, useCreatePlan, useUpdatePlan } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm = { name: "", description: "", minDeposit: "", maxDeposit: "", dailyRate: "", durationDays: "30", features: "", isActive: true };

export default function AdminPlans() {
  const { data: plans, isLoading, refetch } = useListPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const { toast } = useToast();

  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [error, setError] = useState("");
  const isNew = editTarget === "new";

  const openNew = () => {
    setForm(emptyForm);
    setError("");
    setEditTarget("new");
  };

  const openEdit = (plan: any) => {
    const features = Array.isArray(plan.features)
      ? plan.features.join("\n")
      : JSON.parse(plan.features || "[]").join("\n");
    setForm({
      name: plan.name,
      description: plan.description || "",
      minDeposit: plan.minDeposit,
      maxDeposit: plan.maxDeposit || "",
      dailyRate: plan.dailyRate,
      durationDays: String(plan.durationDays),
      features,
      isActive: plan.isActive,
    });
    setError("");
    setEditTarget(plan);
  };

  const handleSave = () => {
    setError("");
    const featuresArray = form.features.split("\n").map((f: string) => f.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      description: form.description,
      minDeposit: form.minDeposit,
      ...(form.maxDeposit ? { maxDeposit: form.maxDeposit } : {}),
      dailyRate: form.dailyRate,
      durationDays: parseInt(form.durationDays),
      features: featuresArray,
      isActive: form.isActive,
    };

    if (isNew) {
      createPlan.mutate(
        { data: payload as any },
        {
          onSuccess: () => { toast({ title: "Plan created!" }); setEditTarget(null); refetch(); },
          onError: (err: any) => setError(err?.data?.error || "Failed to create plan"),
        }
      );
    } else {
      updatePlan.mutate(
        { id: editTarget.id, data: payload as any },
        {
          onSuccess: () => { toast({ title: "Plan updated!" }); setEditTarget(null); refetch(); },
          onError: (err: any) => setError(err?.data?.error || "Failed to update plan"),
        }
      );
    }
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p: any) => ({ ...p, isActive: e.target.checked }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Investment Plans</h1>
          <p className="text-muted-foreground text-sm">Manage platform investment plans</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />New Plan</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="space-y-3">
          {(plans || []).map((plan) => {
            const features: string[] = Array.isArray(plan.features)
              ? plan.features as string[]
              : JSON.parse((plan.features as unknown as string) || "[]");
            return (
              <Card key={plan.id} className="border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{plan.name}</span>
                      <Badge className={`text-xs border ${plan.isActive ? "bg-accent/20 text-accent border-accent/30" : "bg-secondary text-muted-foreground border-border"}`}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.dailyRate}%/day · {plan.minDeposit}–{plan.maxDeposit || "∞"} USDT · {plan.durationDays} days
                    </div>
                    <div className="text-xs text-muted-foreground">{features.length} features configured</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit(plan)} className="gap-2">
                    <Edit2 className="h-4 w-4" /> Edit
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle>{isNew ? "Create New Plan" : "Edit Plan"}</DialogTitle></DialogHeader>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="Starter" />
              </div>
              <div className="space-y-2">
                <Label>Daily Rate (%)</Label>
                <Input type="number" step="0.1" value={form.dailyRate} onChange={e => setForm((p: any) => ({ ...p, dailyRate: e.target.value }))} placeholder="1.5" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} placeholder="Plan description" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Min Deposit (USDT)</Label>
                <Input type="number" value={form.minDeposit} onChange={e => setForm((p: any) => ({ ...p, minDeposit: e.target.value }))} placeholder="69" />
              </div>
              <div className="space-y-2">
                <Label>Max Deposit (USDT)</Label>
                <Input type="number" value={form.maxDeposit} onChange={e => setForm((p: any) => ({ ...p, maxDeposit: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input type="number" value={form.durationDays} onChange={e => setForm((p: any) => ({ ...p, durationDays: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={form.features}
                onChange={e => setForm((p: any) => ({ ...p, features: e.target.value }))}
                rows={4}
                placeholder={"Daily profit distribution\n24/7 monitoring\nEmail support"}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={handleCheckbox}
                className="w-4 h-4 accent-primary"
              />
              <Label htmlFor="isActive">Active (visible to users)</Label>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditTarget(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={createPlan.isPending || updatePlan.isPending} className="flex-1">
                {(createPlan.isPending || updatePlan.isPending) ? "Saving..." : isNew ? "Create Plan" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
