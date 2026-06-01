import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
      <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-invert">
        <h1 className="text-4xl font-bold mb-2 not-prose">Conditions d'Utilisation</h1>
        <p className="text-muted-foreground mb-10 not-prose">Dernière mise à jour : Janvier 2025</p>
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptation des conditions</h2>
            <p>En accédant et en utilisant la plateforme InvestPro, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description du service</h2>
            <p>InvestPro est une plateforme d'investissement numérique permettant aux utilisateurs de déposer des fonds en USDT TRC20, de participer à des plans d'investissement et de bénéficier d'un programme de parrainage multi-niveaux.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Éligibilité</h2>
            <p>Pour utiliser InvestPro, vous devez avoir au moins 18 ans, être légalement autorisé à investir dans votre juridiction, et fournir des informations exactes lors de l'inscription.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Dépôts et retraits</h2>
            <p>Le dépôt minimum est de 69 USDT. Tous les dépôts et retraits s'effectuent exclusivement en USDT via le réseau TRC20. Des frais de 2% s'appliquent sur les retraits. Le minimum de retrait est de 9 USDT.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Risques</h2>
            <p>Les investissements comportent des risques. Les rendements passés ne garantissent pas les rendements futurs. Vous investissez sous votre propre responsabilité. InvestPro ne peut être tenu responsable des pertes liées à vos décisions d'investissement.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Comportements interdits</h2>
            <p>Il est strictement interdit de créer plusieurs comptes, de pratiquer l'auto-parrainage, d'utiliser des VPN ou proxies pour contourner les restrictions, de soumettre de faux hash de transactions, ou de toute autre activité frauduleuse.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Résiliation</h2>
            <p>InvestPro se réserve le droit de suspendre ou de fermer tout compte en cas de violation des présentes conditions, sans préavis ni remboursement.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
            <p>Pour toute question relative aux présentes conditions, ouvrez un ticket de support depuis votre tableau de bord.</p>
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
