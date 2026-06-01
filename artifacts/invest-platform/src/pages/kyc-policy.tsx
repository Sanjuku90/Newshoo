import { Link } from "wouter";
import { ArrowLeft, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KycPolicy() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">InvestPro</Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Politique KYC</h1>
        </div>
        <p className="text-muted-foreground mb-10">Know Your Customer — Connaissance du Client</p>

        <div className="grid gap-4 mb-12">
          {[
            { level: 1, label: "Niveau 1", doc: "Carte d'identité nationale ou passeport", benefit: "Accès aux fonctionnalités de base", color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
            { level: 2, label: "Niveau 2", doc: "Selfie avec pièce d'identité", benefit: "Limites de retrait augmentées", color: "bg-primary/10 border-primary/30 text-primary" },
            { level: 3, label: "Niveau 3", doc: "Justificatif de domicile (moins de 3 mois)", benefit: "Accès complet, limites maximales", color: "bg-green-500/10 border-green-500/30 text-green-400" },
          ].map(({ level, label, doc, benefit, color }) => (
            <Card key={level} className={`border ${color.split(" ")[1]}`}>
              <CardContent className="p-5 flex items-start gap-4">
                <Badge className={color}>{label}</Badge>
                <div>
                  <div className="font-medium text-foreground mb-1">{doc}</div>
                  <div className="text-sm text-muted-foreground">{benefit}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Procédure de vérification</h2>
            <p>Rendez-vous dans la section KYC de votre profil, sélectionnez le niveau que vous souhaitez compléter, téléchargez le document requis en haute qualité (format JPG, PNG ou PDF), et soumettez votre demande. Notre équipe examine les documents sous 24 à 72 heures.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Documents acceptés</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Carte nationale d'identité (recto/verso)</li>
              <li>Passeport (page photo)</li>
              <li>Permis de conduire</li>
              <li>Facture d'électricité, eau ou téléphone fixe (domicile)</li>
              <li>Relevé bancaire récent (domicile)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Refus et recours</h2>
            <p>En cas de refus de votre document KYC, vous recevrez un motif détaillé. Vous pouvez soumettre un nouveau document corrigé depuis votre profil. En cas de litige, ouvrez un ticket de support avec la catégorie "KYC".</p>
          </section>
        </div>
      </div>
      <footer className="border-t border-border bg-card/30 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 InvestPro. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
