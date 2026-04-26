/**
 * Open Justice API Client
 *
 * Endpoint : POST /dialog-flow-executions/run
 * Auth     : Authorization: Bearer <nap_key>
 *
 * The dialog flow nodes use sourcePreference:"docs-only" — content must
 * be in the `documents` array, not in messages.
 *
 * PDFs are parsed server-side via POST /api/extract-pdf (Express endpoint)
 * to avoid browser worker issues with pdfjs-dist.
 *
 * Required env vars (baked in at Vite build time):
 *   VITE_OPENJUSTICE_API_KEY   → nap_...
 *   VITE_OPENJUSTICE_FLOW_ID   → UUID of your dialog flow (optional)
 *   VITE_OPENJUSTICE_MODEL     → optional, defaults to claude-sonnet-4-5
 */

const API_KEY = import.meta.env.VITE_OPENJUSTICE_API_KEY as string;
const FLOW_ID =
  (import.meta.env.VITE_OPENJUSTICE_FLOW_ID as string) ||
  "39be0734-55e5-4930-acc7-cc6f7c42bd52";
const MODEL =
  (import.meta.env.VITE_OPENJUSTICE_MODEL as string) || "claude-sonnet-4-5";

const OJ_ENDPOINT = "/oj-api/dialog-flow-executions/run";
const PDF_ENDPOINT = "/api/extract-pdf";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── PDF extraction (server-side) ────────────────────────────────────────────

async function extractPdfText(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(PDF_ENDPOINT, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`PDF parsing failed: ${err.error}`);
  }
  const { text } = await res.json();
  return text as string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

function buildBody(
  message: string,
  documents: Array<{ name: string; content: string }>
): string {
  return JSON.stringify({
    dialogFlowId: FLOW_ID,
    model: MODEL,
    messages: [{ content: message }],
    documents,
  });
}

async function handleResponse(res: Response): Promise<AnalysisResult> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Open Justice ${res.status}: ${text}`);
  }
  try {
    const json = JSON.parse(text);
    const opinion =
      (json.output as string) ||
      (json.result as string) ||
      (json.opinion as string) ||
      (json.content as string) ||
      (json.message as string) ||
      JSON.stringify(json, null, 2);
    return { opinion, raw: json };
  } catch {
    return { opinion: text };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function analyzeContractText(contractText: string): Promise<AnalysisResult> {
  const res = await fetch(OJ_ENDPOINT, {
    method: "POST",
    headers: headers(),
    body: buildBody(
      "Analyse ce contrat de travail.",
      [{ name: "contrat.txt", content: contractText }]
    ),
  });
  return handleResponse(res);
}

export async function analyzeContractFile(file: File): Promise<AnalysisResult> {
  const text = await extractPdfText(file);
  const res = await fetch(OJ_ENDPOINT, {
    method: "POST",
    headers: headers(),
    body: buildBody(
      `Analyse ce contrat de travail: ${file.name}`,
      [{ name: file.name, content: text }]
    ),
  });
  return handleResponse(res);
}
