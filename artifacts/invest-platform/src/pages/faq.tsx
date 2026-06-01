import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft } from "lucide-react";

const FAQ_ITEMS = [
  { q: "Quel est le dépôt minimum ?", a: "Le dépôt minimum est de 69 USDT via le réseau TRC20. Aucun autre réseau n'est accepté." },
  { q: "Comment déposer des fonds ?", a: "Connectez-vous à votre tableau de bord, allez dans 'Dépôt', copiez notre adresse USDT TRC20, envoyez vos fonds et soumettez le hash de transaction. Votre dépôt sera validé sous 1 à 6 heures." },
  { q: "Quand sont crédités les profits ?", a: "Les profits sont crédités quotidiennement sur votre solde. Vous pouvez les retirer à tout moment une fois le minimum de retrait atteint." },
  { q: "Quel est le minimum de retrait ?", a: "Le minimum de retrait est de 9 USDT. Des frais de 2% s'appliquent sur chaque retrait." },
  { q: "Comment fonctionne le système de parrainage ?", a: "Vous gagnez des commissions sur 3 niveaux : 10% sur les investissements de vos filleuls directs (Niveau 1), 5% sur le Niveau 2, et 2% sur le Niveau 3. Les commissions sont créditées instantanément." },
  { q: "Qu'est-ce que le bonus de leader ?", a: "Lorsque vous atteignez des paliers de filleuls actifs, vous recevez automatiquement un bonus : 25 USDT pour 10 filleuls, 150 USDT pour 50 filleuls, 500 USDT pour 100 filleuls, et 5 000 USDT pour 500 filleuls actifs." },
  { q: "Comment fonctionne le KYC ?", a: "Le KYC (Know Your Customer) se fait en 3 niveaux : Niveau 1 (carte d'identité), Niveau 2 (selfie avec pièce d'identité), Niveau 3 (justificatif de domicile). Un KYC complet améliore vos limites de retrait." },
  { q: "Qu'est-ce que le niveau VIP ?", a: "Votre niveau VIP est calculé automatiquement selon votre capital total investi : VIP1 dès 500 USDT, VIP2 dès 2 000 USDT, VIP3 dès 5 000 USDT, VIP4 dès 10 000 USDT, VIP5 dès 25 000 USDT." },
  { q: "Mon compte peut-il être suspendu ?", a: "Oui, les comptes impliqués dans une activité frauduleuse (multi-comptes, auto-parrainage, faux dépôts) seront immédiatement suspendus ou bannis conformément à notre politique anti-fraude." },
  { q: "Comment contacter le support ?", a: "Ouvrez un ticket de support depuis votre tableau de bord. Notre équipe répond sous 24 à 48 heures. Pour les clients VIP, le support est disponible en priorité." },
];

export default function FAQ() {
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
        <h1 className="text-4xl font-bold mb-3">Foire Aux Questions</h1>
        <p className="text-muted-foreground mb-10">Tout ce que vous devez savoir sur InvestPro.</p>
        <Accordion type="single" collapsible className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <footer className="border-t border-border bg-card/30 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 InvestPro. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
