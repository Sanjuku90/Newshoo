import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPromoCodes() {
  const { token } = useAuth() as any;
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", type: "fixed", value: "", maxUses: "", description: "", expiresAt: "" });

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const res = await fetch("/api/admin/promo-codes", { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      setOpen(false);
      setForm({ code: "", type: "fixed", value: "", maxUses: "", description: "", expiresAt: "" });
      toast({ title: "Code promo créé !" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-promo-codes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      toast({ title: "Code supprimé" });
    },
  });

  const handleCreate = () => {
    if (!form.code || !form.value) return;
    createMutation.mutate({
      code: form.code,
      type: form.type,
      value: parseFloat(form.value),
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      description: form.description || null,
      expiresAt: form.expiresAt || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Codes Promo</h1>
            <p className="text-muted-foreground text-sm">{codes.length} codes créés</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Créer un code</Button>
          </DialogTrigger>
          <DialogContent className="dark bg-card border-border">
            <DialogHeader>
              <DialogTitle>Nouveau code promo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Code</Label>
                  <Input placeholder="WELCOME25" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="uppercase" />
                </div>
                <div className="space-y-1.5">
                  <Label>Montant (USDT)</Label>
                  <Input type="number" placeholder="25" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Max. utilisations</Label>
                  <Input type="number" placeholder="100 (vide = illimité)" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Expiration</Label>
                  <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description (optionnel)</Label>
                <Input placeholder="Bonus de bienvenue" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Création..." : "Créer le code"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-base">Tous les codes</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : codes.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Aucun code promo créé</div>
          ) : (
            <div className="divide-y divide-border">
              {codes.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-mono text-base px-3 py-1 border-primary/30 text-primary">{c.code}</Badge>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-accent">+{c.value} USDT</span>
                        {c.description && <span className="text-sm text-muted-foreground">{c.description}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""} utilisations
                        {c.expiresAt && ` · Expire le ${new Date(c.expiresAt).toLocaleDateString("fr-FR")}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={c.isActive ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}>
                      {c.isActive ? "Actif" : "Inactif"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: c.id, isActive: !c.isActive })}>
                      {c.isActive ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
