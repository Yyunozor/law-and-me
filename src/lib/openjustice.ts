/**
 * Open Justice API Client
 *
 * Endpoint : POST /dialog-flow-executions/run
 * Auth     : Authorization: Bearer <nap_key>
 *
 * In local dev, Vite proxies /oj-api → https://api.openjustice.ai (CORS bypass).
 * In Replit production, the Express backend server proxies the same path.
 *
 * Required env vars:
 *   VITE_OPENJUSTICE_API_KEY   → nap_...
 *   VITE_OPENJUSTICE_FLOW_ID   → UUID of your dialog flow
 *   VITE_OPENJUSTICE_MODEL     → optional, defaults to claude-sonnet-4-5
 */

const API_KEY = import.meta.env.VITE_OPENJUSTICE_API_KEY as string;
const FLOW_ID =
  (import.meta.env.VITE_OPENJUSTICE_FLOW_ID as string) ||
  "39be0734-55e5-4930-acc7-cc6f7c42bd52";
const MODEL =
  (import.meta.env.VITE_OPENJUSTICE_MODEL as string) || "claude-sonnet-4-5";

// Relative path — proxied by Vite (dev) or Express (production on Replit)
const ENDPOINT = "/oj-api/dialog-flow-executions/run";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

function buildBody(content: string): string {
  return JSON.stringify({
    dialogFlowId: FLOW_ID,
    model: MODEL,
    messages: [{ content }],
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

export async function analyzeContractText(text: string): Promise<AnalysisResult> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: headers(),
    body: buildBody(text),
  });
  return handleResponse(res);
}

export async function analyzeContractFile(file: File): Promise<AnalysisResult> {
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
  return analyzeContractText(`[Contrat PDF: ${file.name}]\n\n${text}`);
}
