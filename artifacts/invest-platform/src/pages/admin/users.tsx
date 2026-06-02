import { useState } from "react";
import { useListAdminUsers, useUpdateAdminUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Wallet, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const kycBadge: Record<string, string> = {
  approved: "bg-accent/20 text-accent border-accent/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  not_submitted: "bg-secondary text-muted-foreground border-border",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [balanceMode, setBalanceMode] = useState<"set" | "add" | "subtract">("set");
  const [balanceInput, setBalanceInput] = useState("0");

  const { data, isLoading, refetch } = useListAdminUsers({ page, limit: 20, search: search || undefined });
  const updateUser = useUpdateAdminUser();
  const { toast } = useToast();

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({ status: user.status });
    setBalanceMode("set");
    setBalanceInput(parseFloat(user.mainBalance || "0").toFixed(2));
  };

  const computeNewBalance = (): number => {
    const current = parseFloat(selectedUser?.mainBalance || "0");
    const input = parseFloat(balanceInput) || 0;
    if (balanceMode === "set") return input;
    if (balanceMode === "add") return current + input;
    if (balanceMode === "subtract") return Math.max(0, current - input);
    return current;
  };

  const handleSave = () => {
    const newBalance = computeNewBalance();
    const payload: any = { status: editForm.status };
    payload.mainBalance = newBalance;

    updateUser.mutate(
      { id: selectedUser.id, data: payload },
      {
        onSuccess: () => {
          toast({ title: "Utilisateur mis à jour !", description: `Nouveau solde : ${newBalance.toFixed(2)} USDT` });
          setSelectedUser(null);
          refetch();
        },
        onError: (err: any) => toast({ title: "Erreur", description: err?.data?.error || "Échec de la mise à jour", variant: "destructive" }),
      }
    );
  };

  const d = data as any;
  const users = d?.users || d?.data || [];
  const total = d?.total || 0;

  const currentBalance = parseFloat(selectedUser?.mainBalance || "0");
  const newBalance = selectedUser ? computeNewBalance() : 0;
  const balanceDiff = newBalance - currentBalance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Utilisateurs</h1>
        <p className="text-muted-foreground text-sm">{total} utilisateurs au total</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Rechercher par nom ou email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 pr-4">Nom</th>
                  <th className="text-left py-3 pr-4">Email</th>
                  <th className="text-left py-3 pr-4">Solde</th>
                  <th className="text-left py-3 pr-4">KYC</th>
                  <th className="text-left py-3 pr-4">Statut</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-3 pr-4 font-medium">{user.firstName} {user.lastName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 pr-4 font-mono">{parseFloat(user.mainBalance || "0").toFixed(2)} USDT</td>
                    <td className="py-3 pr-4">
                      <Badge className={`text-xs border ${kycBadge[user.kycStatus] || kycBadge.not_submitted}`}>{user.kycStatus}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={`text-xs border ${user.status === "active" ? "bg-accent/20 text-accent border-accent/30" : "bg-destructive/20 text-destructive border-destructive/30"}`}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>Modifier</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Affichage de {users.length} sur {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Précédent</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p+1)} disabled={users.length < 20}>Suivant</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!selectedUser} onOpenChange={open => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier : {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">

            {/* Statut */}
            <div className="space-y-2">
              <Label>Statut du compte</Label>
              <select
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground"
                value={editForm.status || ""}
                onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))}
              >
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="banned">Banni</option>
              </select>
            </div>

            {/* Solde */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <Label>Solde principal</Label>
                <span className="ml-auto text-sm text-muted-foreground font-mono">
                  Actuel : <span className="text-foreground font-semibold">{currentBalance.toFixed(2)} USDT</span>
                </span>
              </div>

              {/* Mode buttons */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/40 rounded-lg">
                <button
                  onClick={() => { setBalanceMode("set"); setBalanceInput(currentBalance.toFixed(2)); }}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${balanceMode === "set" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Définir
                </button>
                <button
                  onClick={() => { setBalanceMode("add"); setBalanceInput("0"); }}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${balanceMode === "add" ? "bg-card text-accent shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Plus className="h-3 w-3" /> Ajouter
                </button>
                <button
                  onClick={() => { setBalanceMode("subtract"); setBalanceInput("0"); }}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${balanceMode === "subtract" ? "bg-card text-destructive shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Minus className="h-3 w-3" /> Déduire
                </button>
              </div>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={balanceInput}
                onChange={e => setBalanceInput(e.target.value)}
                placeholder={balanceMode === "set" ? "Nouveau solde..." : "Montant..."}
                className="font-mono"
              />

              {/* Preview */}
              {selectedUser && (
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm border ${
                  balanceDiff > 0 ? "bg-accent/10 border-accent/30 text-accent"
                  : balanceDiff < 0 ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-secondary/30 border-border text-muted-foreground"
                }`}>
                  <span>Nouveau solde</span>
                  <span className="font-mono font-bold">
                    {newBalance.toFixed(2)} USDT
                    {balanceDiff !== 0 && (
                      <span className="ml-2 text-xs opacity-80">
                        ({balanceDiff > 0 ? "+" : ""}{balanceDiff.toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={() => setSelectedUser(null)} className="flex-1">Annuler</Button>
              <Button onClick={handleSave} disabled={updateUser.isPending} className="flex-1">
                {updateUser.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
