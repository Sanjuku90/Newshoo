import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

export default function AML() {
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
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Politique AML</h1>
        </div>
        <p className="text-muted-foreground mb-2">Anti-Blanchiment d'Argent (Anti-Money Laundering)</p>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : Janvier 2025</p>
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Engagement</h2>
            <p>InvestPro s'engage à respecter les meilleures pratiques en matière de lutte contre le blanchiment d'argent et le financement du terrorisme. Notre plateforme applique des procédures strictes de conformité.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Vérification d'identité (KYC)</h2>
            <p>Tout utilisateur est tenu de compléter notre processus de vérification d'identité. Les utilisateurs dont l'identité ne peut être vérifiée verront leurs capacités de retrait limitées et pourront être soumis à des contrôles supplémentaires.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Surveillance des transactions</h2>
            <p>Toutes les transactions sur InvestPro font l'objet d'une surveillance automatisée. Les transactions inhabituelles, les dépôts importants ou les modèles d'activité suspects déclenchent des alertes et des examens manuels par notre équipe de conformité.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Signalement</h2>
            <p>Conformément aux obligations légales, InvestPro signalera aux autorités compétentes toute activité suspecte pouvant être liée au blanchiment d'argent, au financement du terrorisme ou à d'autres activités illicites.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Gel des comptes</h2>
            <p>InvestPro se réserve le droit de geler immédiatement tout compte et les fonds associés en cas de suspicion d'activité frauduleuse ou illicite, et ce sans préavis.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Origine des fonds</h2>
            <p>Tous les fonds déposés sur InvestPro doivent être d'origine légale. Il est strictement interdit d'utiliser notre plateforme pour blanchir des fonds issus d'activités criminelles.</p>
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
