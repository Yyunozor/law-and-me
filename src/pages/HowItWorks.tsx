import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "INPUT",
      subtitle: "Upload votre contrat",
      desc: "Fournissez votre contrat au format PDF ou copiez-collez simplement le texte dans notre terminal sécurisé. Vos données ne sont pas stockées."
    },
    {
      num: "02",
      title: "ANALYSE",
      subtitle: "Traitement IA",
      desc: "Notre moteur croise chaque clause avec les articles du Code des Obligations (CO), la Loi sur le Travail (LTr) et la jurisprudence suisse."
    },
    {
      num: "03",
      title: "OUTPUT",
      subtitle: "Résultat structuré",
      desc: "Obtenez un rapport de conformité clair, catégorisant les clauses : conformes, litigieuses, ou strictement illégales."
    }
  ];

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen max-w-6xl mx-auto">
      <div className="font-mono text-primary text-sm mb-6">
        &gt; documentation --process
      </div>
      
      <h1 className="text-4xl font-bold mb-16 text-white">Comment ça marche</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="terminal-card flex flex-col h-full"
          >
            <div className="text-primary font-bold mb-4">
              // {step.num} {step.title}
            </div>
            <h3 className="text-xl font-sans font-bold text-white mb-4">
              {step.subtitle}
            </h3>
            <p className="text-sm text-muted-foreground flex-grow">
              {step.desc}
            </p>
            <div className="mt-8 pt-4 border-t border-border border-dashed text-xs text-muted-foreground flex justify-between">
              <span>status: ready</span>
              <span>[ OK ]</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 border border-border p-8 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 font-mono text-primary/20 text-4xl font-bold select-none">
          SYS.INFO
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 relative z-10">Pourquoi utiliser Law&Me ?</h2>
        <div className="space-y-4 text-muted-foreground font-sans relative z-10 max-w-3xl">
          <p>
            Le droit du travail suisse repose sur une combinaison de lois impératives, semi-impératives et de conventions collectives. Il est souvent difficile pour un employé de savoir si une clause est légale.
          </p>
          <p>
            Law&Me agit comme une première ligne de défense. L'outil vous permet d'identifier instantanément les anomalies avant de signer, vous donnant le pouvoir de négocier en connaissance de cause.
          </p>
        </div>
      </div>
    </div>
  );
}
