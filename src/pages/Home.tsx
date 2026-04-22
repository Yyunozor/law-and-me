import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShieldAlert, FileText, Zap, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 font-mono text-primary/30 text-xs hidden md:block">
          <p>// init sequence</p>
          <p>&gt; load_swiss_law_db.sh</p>
          <p>[ OK ] Modules loaded</p>
        </div>
        <div className="absolute bottom-1/4 right-10 font-mono text-primary/30 text-xs hidden md:block text-right">
          <p>sys.status: optimal</p>
          <p>v.2026.1</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-4xl"
        >
          <div className="inline-block mb-4 px-3 py-1 border border-primary/30 bg-primary/5 text-primary font-mono text-xs uppercase tracking-widest">
            Scan. Analyze. Understand.
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
            <span className="text-white">Law</span>
            <span className="text-primary">&Me</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-tight">
            Votre contrat de travail,<br/>
            <span className="text-white font-medium">enfin compréhensible.</span>
          </p>

          <Link href="/analyser">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 font-mono font-bold text-background bg-primary hover:bg-primary/90 transition-all duration-200 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2 text-lg">
                Analyser mon contrat
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 h-full w-full border-2 border-primary group-hover:scale-105 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="font-mono text-primary mb-12 text-sm">
            &gt; capabilities.list()
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="w-8 h-8 text-primary mb-4" />,
                title: "Analyse Instantanée",
                desc: "Détection immédiate des clauses standard et inhabituelles de votre contrat via notre moteur d'analyse."
              },
              {
                icon: <ShieldAlert className="w-8 h-8 text-primary mb-4" />,
                title: "Conformité Suisse",
                desc: "Vérification stricte selon le Code des Obligations (CO) et la Loi sur le Travail (LTr)."
              },
              {
                icon: <Zap className="w-8 h-8 text-primary mb-4" />,
                title: "Clarté Absolue",
                desc: "Traduction du jargon juridique en langage clair, avec des indicateurs visuels précis."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="terminal-card group hover:border-primary/50 transition-colors"
              >
                {feature.icon}
                <h3 className="text-xl font-bold mb-2 font-sans text-white">{feature.title}</h3>
                <p className="text-muted-foreground text-sm font-sans">{feature.desc}</p>
                <div className="mt-6 text-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  [ RUN MODULE ]
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">Le pouvoir de savoir ce que vous signez.</h2>
          <p className="text-lg text-muted-foreground mb-12 font-sans">
            Ne laissez pas le jargon juridique vous intimider. Reprenez le contrôle de vos conditions de travail avec un outil conçu pour la clarté et la protection des employés.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-8 font-mono border border-border p-8 bg-background/50">
            <div className="flex-1">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Droit Suisse</div>
            </div>
            <div className="hidden md:block w-px bg-border"></div>
            <div className="flex-1">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Disponibilité</div>
            </div>
            <div className="hidden md:block w-px bg-border"></div>
            <div className="flex-1">
              <div className="text-4xl font-bold text-primary mb-2">0 CHF</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Coût d'analyse</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
