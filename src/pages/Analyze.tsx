import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  UploadCloud,
  Terminal,
  Loader2,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";
import { analyzeContractText, analyzeContractFile } from "@/lib/openjustice";
import type { AnalysisResult } from "@/lib/openjustice";

// ─── Upload zone ─────────────────────────────────────────────────────────────

function UploadZone({
  file,
  onFile,
  onClear,
  disabled,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") onFile(dropped);
  };

  return (
    <div
      onClick={() => !disabled && !file && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[
        "border-2 border-dashed rounded-none p-12 flex flex-col items-center justify-center text-center transition-colors",
        file
          ? "border-primary/60 bg-primary/10 cursor-default"
          : disabled
          ? "border-border/30 bg-background cursor-not-allowed opacity-50"
          : dragging
          ? "border-primary bg-primary/15 cursor-copy"
          : "border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer group",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />

      {file ? (
        <>
          <FileText className="w-12 h-12 text-primary mb-4" />
          <p className="font-mono text-white text-sm mb-1 break-all">{file.name}</p>
          <p className="text-xs text-muted-foreground font-mono mb-4">
            {(file.size / 1024).toFixed(0)} KB
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="flex items-center gap-1 text-xs font-mono text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1 transition-colors"
          >
            <X size={12} /> Retirer
          </button>
        </>
      ) : (
        <>
          <UploadCloud className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
          <p className="font-mono text-white mb-2">Glissez-déposez votre contrat PDF ici</p>
          <p className="text-xs text-muted-foreground font-mono">Max 10 MB · Format PDF uniquement</p>
          <div className="mt-6 px-4 py-2 border border-primary text-primary text-xs font-mono">
            [ PARCOURIR LES FICHIERS ]
          </div>
        </>
      )}
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function ResultPanel({ result }: { result: AnalysisResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border bg-background relative overflow-hidden"
    >
      <div className="h-1 bg-gradient-to-r from-primary via-yellow-400 to-red-500" />

      <div className="p-6 md:p-10">
        <h2 className="font-mono text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-primary">&gt;</span>
          Avis de droit — analyse du contrat
        </h2>

        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:font-semibold prose-headings:text-white
          prose-h2:text-base prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
          prose-h3:text-sm prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-primary
          prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-2
          prose-li:text-gray-300 prose-li:my-0.5
          prose-ul:my-2 prose-ol:my-2
          prose-strong:text-white prose-strong:font-semibold
          prose-hr:border-border prose-hr:my-6
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded
        ">
          <ReactMarkdown>{result.opinion}</ReactMarkdown>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground font-mono">
          <span className="text-primary">!</span> Cette analyse est générée à titre indicatif sur la
          base du droit suisse. Elle ne constitue pas un avis juridique formel. Consultez un avocat
          pour une validation officielle.
        </div>
      </div>
    </motion.div>
  );
}

// ─── Error panel ─────────────────────────────────────────────────────────────

function ErrorPanel({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-red-500/30 bg-red-500/5 p-6 font-mono"
    >
      <div className="flex items-start gap-3 text-red-400 mb-4">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">[ ERREUR API ]</p>
          <p className="text-sm text-red-300">{error.message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="text-xs border border-red-500/40 text-red-400 hover:text-red-300 px-4 py-2 transition-colors"
      >
        [ RÉESSAYER ]
      </button>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Analyze() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const hasInput = file !== null || text.trim().length > 0;

  const mutation = useMutation({
    mutationFn: async () => {
      if (file) return analyzeContractFile(file);
      return analyzeContractText(text);
    },
  });

  const handleAnalyze = () => {
    if (!hasInput) return;
    mutation.mutate();
  };

  const handleReset = () => {
    mutation.reset();
    setFile(null);
    setText("");
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="font-mono text-primary text-sm mb-6 flex items-center gap-2">
        <Terminal size={16} />
        <span>~/law-and-me/analyzer</span>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-white">Analyseur de contrat</h1>

      {/* Inputs — masqués pendant le chargement ou après résultat */}
      <AnimatePresence>
        {!mutation.isSuccess && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <UploadZone
                file={file}
                onFile={(f) => { setFile(f); setText(""); }}
                onClear={() => setFile(null)}
                disabled={mutation.isPending}
              />

              <div className="flex flex-col">
                <label className="font-mono text-xs text-muted-foreground mb-2 block uppercase tracking-wider">
                  Ou collez le texte de votre contrat
                </label>
                <textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value); setFile(null); }}
                  disabled={mutation.isPending || file !== null}
                  className="w-full flex-grow min-h-[200px] bg-background border border-border focus:border-primary outline-none p-4 font-mono text-sm text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={
                    file
                      ? "← Fichier PDF sélectionné"
                      : "Entre les soussignés...\n\nArticle 1 : Fonction\nL'employé est engagé en qualité de..."
                  }
                />
              </div>
            </div>

            <div className="flex justify-center mb-16 gap-4">
              <button
                onClick={handleAnalyze}
                disabled={mutation.isPending || !hasInput}
                className="font-mono px-8 py-4 bg-primary text-background font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>ANALYSE EN COURS...</span>
                  </>
                ) : (
                  <span>[ EXECUTE: LANCER L'ANALYSE ]</span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultats */}
      <AnimatePresence mode="wait">
        {mutation.isSuccess && mutation.data && (
          <div key="result">
            <ResultPanel result={mutation.data} />
            <div className="flex justify-center mt-8">
              <button
                onClick={handleReset}
                className="font-mono text-sm border border-border text-muted-foreground hover:text-white hover:border-primary px-6 py-3 transition-colors"
              >
                [ NOUVELLE ANALYSE ]
              </button>
            </div>
          </div>
        )}

        {mutation.isError && (
          <ErrorPanel
            key="error"
            error={mutation.error as Error}
            onRetry={handleAnalyze}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
