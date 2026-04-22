import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-sans font-bold text-xl tracking-tighter block mb-4">
              <span className="text-white">Law</span>
              <span className="text-primary">&Me</span>
            </span>
            <p className="text-muted-foreground font-mono text-xs mb-4">
              &gt; Votre contrat de travail, enfin compréhensible.<br/>
              &gt; system.status: [ ONLINE ]
            </p>
          </div>
          
          <div className="font-mono text-sm">
            <h3 className="text-white font-bold mb-4">// Équipe</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>- Noée</li>
              <li>- Mathilde</li>
              <li>- Iliana</li>
              <li className="pt-2 text-primary/70">Projet: Enjeux juridiques à l'ère numérique</li>
              <li className="text-primary/70">Printemps 2026</li>
            </ul>
          </div>

          <div className="font-mono text-sm">
            <h3 className="text-white font-bold mb-4">// Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mentions">
                  <span className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Mentions légales</span>
                </Link>
              </li>
            </ul>
            <div className="mt-4 p-4 border border-border bg-background/50 text-xs text-muted-foreground">
              <span className="text-primary mr-2">!</span>
              Cet outil est fourni à des fins éducatives et ne remplace en aucun cas les conseils d'un avocat qualifié.
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center font-mono text-xs text-muted-foreground">
          <p>&copy; 2026 Law&Me. Tous droits réservés.</p>
          <p className="mt-2 md:mt-0">Droit Suisse // CH</p>
        </div>
      </div>
    </footer>
  );
}
