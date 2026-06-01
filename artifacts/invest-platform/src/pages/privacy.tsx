import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-2">Politique de Confidentialité</h1>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : Janvier 2025</p>
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Données collectées</h2>
            <p>Nous collectons les informations suivantes lors de l'inscription : nom, prénom, adresse email, numéro de téléphone, pays et ville de résidence. Lors de l'utilisation du service, nous enregistrons également votre adresse IP, les données de connexion et l'historique des transactions.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour gérer votre compte, traiter vos transactions, prévenir la fraude, respecter nos obligations légales (KYC/AML), et vous contacter en cas de besoin lié à votre compte.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Partage des données</h2>
            <p>Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées avec des autorités compétentes en cas d'obligation légale, ou avec nos partenaires de vérification KYC dans le cadre de nos obligations de conformité.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Sécurité</h2>
            <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données : chiffrement des mots de passe, surveillance des connexions, détection des activités suspectes.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Conservation</h2>
            <p>Vos données sont conservées pendant toute la durée de votre relation avec InvestPro, puis pendant 5 ans après la clôture de votre compte, conformément aux obligations légales.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Vos droits</h2>
            <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, ouvrez un ticket de support depuis votre tableau de bord.</p>
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
