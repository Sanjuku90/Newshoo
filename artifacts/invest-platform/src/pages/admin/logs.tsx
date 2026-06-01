import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  approve_deposit: "bg-green-500/10 text-green-400 border-green-500/30",
  reject_deposit: "bg-red-500/10 text-red-400 border-red-500/30",
  approve_withdrawal: "bg-green-500/10 text-green-400 border-green-500/30",
  reject_withdrawal: "bg-red-500/10 text-red-400 border-red-500/30",
  approve_kyc: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  reject_kyc: "bg-red-500/10 text-red-400 border-red-500/30",
  update_user: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  create_plan: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  reply_ticket: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  close_ticket: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  create_promo_code: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

function getActionColor(action: string) {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.startsWith(key)) return color;
  }
  return "bg-secondary text-muted-foreground border-border";
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const { token } = useAuth() as any;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs", page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/logs?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Journal d'audit</h1>
          <p className="text-muted-foreground text-sm">{total} actions enregistrées</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Actions administratives</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Aucune action enregistrée</div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between px-6 py-3 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <Badge variant="outline" className={`shrink-0 text-xs ${getActionColor(log.action)}`}>
                      {formatAction(log.action)}
                    </Badge>
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{log.adminName}</span>
                      {log.targetType && (
                        <span className="text-muted-foreground text-sm ml-2">
                          → {log.targetType} #{log.targetId}
                        </span>
                      )}
                      {log.details && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{log.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xs text-muted-foreground">{log.ipAddress}</div>
                    <div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("fr-FR")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Page {page} sur {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
