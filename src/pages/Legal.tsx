export default function Legal() {
  return (
    <div className="pt-24 pb-12 px-4 min-h-screen max-w-4xl mx-auto">
      <div className="font-mono text-primary text-sm mb-6">
        &gt; view legal_disclaimer.md
      </div>

      <h1 className="text-4xl font-bold mb-12 text-white">Mentions Légales</h1>

      <div className="space-y-8 text-muted-foreground font-sans">
        <section className="terminal-card border-red-500/30">
          <h2 className="text-xl font-bold text-red-500 mb-4 font-mono">
            [ ! ] Avertissement Important
          </h2>
          <p className="mb-4 text-white">
            Law&Me est un outil académique développé dans le cadre du cours "Enjeux juridiques à l'ère numérique" (Printemps 2026).
          </p>
          <p>
            <strong>Cet outil NE REMPLACE PAS les conseils d'un avocat qualifié.</strong> L'analyse générée par Law&Me est fournie à titre purement indicatif et éducatif. Le droit suisse est complexe, sujet à interprétation et à l'évolution de la jurisprudence.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">1. Éditeur du site</h2>
          <p>
            Le présent site est un projet étudiant réalisé par Noée, Mathilde et Iliana.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">2. Protection des données</h2>
          <p>
            Les contrats uploadés ou collés sur la plateforme sont traités localement ou de manière éphémère à des fins de démonstration. Aucune donnée personnelle ou contractuelle n'est stockée de manière permanente sur nos serveurs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">3. Droit applicable</h2>
          <p>
            Le fonctionnement de l'outil se base sur les principes généraux du Code des Obligations suisse (CO) et de la Loi sur le Travail (LTr). En cas de litige réel concernant votre contrat de travail, veuillez consulter une permanence juridique, un syndicat ou un avocat spécialiste du droit du travail en Suisse.
          </p>
        </section>
      </div>
    </div>
  );
}
