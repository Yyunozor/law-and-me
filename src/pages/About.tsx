import { motion } from "framer-motion";

export default function About() {
  const team = [
    { name: "Noée", role: "Design & Legal Logic" },
    { name: "Mathilde", role: "Systems Architecture" },
    { name: "Iliana", role: "Data Analysis" },
  ];

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen max-w-5xl mx-auto">
      <div className="font-mono text-primary text-sm mb-6">
        &gt; cat about.txt
      </div>

      <h1 className="text-4xl font-bold mb-8 text-white">À propos du projet</h1>

      <div className="prose prose-invert max-w-none font-sans mb-16 text-muted-foreground">
        <p className="text-lg text-white font-medium">
          Ce projet s'inscrit dans le cadre du cours "Enjeux juridiques à l'ère numérique" (Printemps 2026).
        </p>
        <p>
          L'objectif de Law&Me est de démontrer comment la technologie peut être mise au service de l'accès au droit. Dans un monde où les contrats deviennent de plus en plus complexes, il est crucial d'outiller les travailleurs avec des solutions capables de décoder le jargon juridique.
        </p>
        <p>
          Nous croyons en un droit accessible, transparent et équitable. Law&Me est notre réponse technique à l'asymétrie d'information qui existe souvent entre employeur et employé au moment de la signature d'un contrat.
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-8 text-white font-mono">
        <span className="text-primary mr-2">//</span> L'équipe
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
            className="border border-border bg-background p-6 group hover:border-primary transition-colors"
          >
            <div className="w-16 h-16 mb-6 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-2xl font-bold">
              {member.name[0]}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
            <p className="font-mono text-xs text-primary uppercase tracking-widest">{member.role}</p>
            <div className="mt-6 h-1 w-8 bg-border group-hover:bg-primary transition-colors"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
