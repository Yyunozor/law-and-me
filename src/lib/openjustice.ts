/**
 * Open Justice contract analysis client.
 *
 * All heavy lifting (citation upload, conversation creation, SSE stream,
 * auto-resume) runs in the Express server at POST /api/analyze-contract.
 * PDF extraction is also server-side at POST /api/extract-pdf.
 */

export interface Clause {
  status: "conforme" | "attention" | "illegal" | "info";
  label: string;
  detail?: string;
}

export interface AnalysisResult {
  opinion: string;
  clauses?: Clause[];
  raw?: unknown;
}

async function extractPdfText(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/extract-pdf", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`PDF parsing failed: ${err.error}`);
  }
  const { text } = await res.json();
  return text as string;
}

async function analyzeText(text: string, fileName: string): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze-contract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, fileName }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Analyse échouée (${res.status})`);
  return { opinion: json.opinion as string };
}

export async function analyzeContractText(contractText: string): Promise<AnalysisResult> {
  return analyzeText(contractText, "contrat.txt");
}

export async function analyzeContractFile(file: File): Promise<AnalysisResult> {
  const text = await extractPdfText(file);
  return analyzeText(text, file.name);
}
