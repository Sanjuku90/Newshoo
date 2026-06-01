import { useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TYPE_LABELS: Record<string, string> = {
  deposit: "Dépôt",
  withdrawal: "Retrait",
  investment: "Investissement",
  commission: "Commission",
  leader_bonus: "Bonus Leader",
  promo_bonus: "Bonus Promo",
  profit: "Profit",
};

const TYPE_COLORS: Record<string, string> = {
  deposit: "text-green-400",
  withdrawal: "text-red-400",
  investment: "text-blue-400",
  commission: "text-primary",
  leader_bonus: "text-yellow-400",
  promo_bonus: "text-orange-400",
  profit: "text-accent",
};

export default function History() {
  const { data, isLoading } = useListTransactions({ limit: 200 });
  const { toast } = useToast();

  const transactions = (data as any)?.items ?? [];

  const exportCSV = () => {
    const headers = ["Date", "Type", "Montant (USDT)", "Statut", "Description"];
    const rows = transactions.map((tx: any) => [
      new Date(tx.createdAt).toLocaleDateString("fr-FR"),
      TYPE_LABELS[tx.type] ?? tx.type,
      parseFloat(tx.amount).toFixed(2),
      tx.status,
      tx.description ?? "",
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investpro_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV réussi !" });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("InvestPro — Historique des transactions", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Type", "Montant", "Statut", "Description"]],
      body: transactions.map((tx: any) => [
        new Date(tx.createdAt).toLocaleDateString("fr-FR"),
        TYPE_LABELS[tx.type] ?? tx.type,
        `${parseFloat(tx.amount).toFixed(2)} USDT`,
        tx.status,
        tx.description ?? "",
      ]),
      headStyles: { fillColor: [30, 30, 40] },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      styles: { fontSize: 9 },
    });

    doc.save(`investpro_transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: "Export PDF réussi !" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Historique</h1>
          <p className="text-muted-foreground text-sm">Toutes vos transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV} disabled={transactions.length === 0}>
            <Table className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportPDF} disabled={transactions.length === 0}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            {transactions.length} transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Aucune transaction</div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-3 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[tx.type]?.replace("text-", "bg-") ?? "bg-muted-foreground"}`} />
                    <div>
                      <div className="text-sm font-medium">{TYPE_LABELS[tx.type] ?? tx.type}</div>
                      <div className="text-xs text-muted-foreground">{tx.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${TYPE_COLORS[tx.type] ?? "text-foreground"}`}>
                      {parseFloat(tx.amount) > 0 ? "+" : ""}{parseFloat(tx.amount).toFixed(2)} USDT
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("fr-FR")}</div>
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
