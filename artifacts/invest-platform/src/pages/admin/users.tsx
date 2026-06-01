import { useState } from "react";
import { useListAdminUsers, useUpdateAdminUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
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

  const { data, isLoading, refetch } = useListAdminUsers({ page, limit: 20, search: search || undefined });
  const updateUser = useUpdateAdminUser();
  const { toast } = useToast();

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({ status: user.status, role: user.role, vipLevel: user.vipLevel, bonusAmount: "0", bonusNote: "" });
  };

  const handleSave = () => {
    updateUser.mutate(
      { id: selectedUser.id, data: editForm },
      {
        onSuccess: () => {
          toast({ title: "User updated!" });
          setSelectedUser(null);
          refetch();
        },
        onError: (err: any) => toast({ title: "Error", description: err?.data?.error || "Failed to update user", variant: "destructive" }),
      }
    );
  };

  const d = data as any;
  const users = d?.users || [];
  const total = d?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Users</h1>
        <p className="text-muted-foreground text-sm">{total} total users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 pr-4">Name</th>
                  <th className="text-left py-3 pr-4">Email</th>
                  <th className="text-left py-3 pr-4">Balance</th>
                  <th className="text-left py-3 pr-4">KYC</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-3 pr-4 font-medium">{user.firstName} {user.lastName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 pr-4">{parseFloat(user.mainBalance || "0").toFixed(2)} USDT</td>
                    <td className="py-3 pr-4">
                      <Badge className={`text-xs border ${kycBadge[user.kycStatus] || kycBadge.not_submitted}`}>{user.kycStatus}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={`text-xs border ${user.status === "active" ? "bg-accent/20 text-accent border-accent/30" : "bg-destructive/20 text-destructive border-destructive/30"}`}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {users.length} of {total}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p+1)} disabled={users.length < 20}>Next</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!selectedUser} onOpenChange={open => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground" value={editForm.status || ""} onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>VIP Level</Label>
                <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground" value={editForm.vipLevel || 1} onChange={e => setEditForm((p: any) => ({ ...p, vipLevel: parseInt(e.target.value) }))}>
                  {[1,2,3,4,5].map(l => <option key={l} value={l}>VIP {l}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Add Bonus (USDT)</Label>
              <Input type="number" min="0" step="0.01" value={editForm.bonusAmount || "0"} onChange={e => setEditForm((p: any) => ({ ...p, bonusAmount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Bonus Note</Label>
              <Input placeholder="Reason for bonus..." value={editForm.bonusNote || ""} onChange={e => setEditForm((p: any) => ({ ...p, bonusNote: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedUser(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={updateUser.isPending} className="flex-1">
                {updateUser.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
