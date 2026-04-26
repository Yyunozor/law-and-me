/**
 * Open Justice API Client
 *
 * Endpoint : POST /dialog-flow-executions/run
 * Auth     : Authorization: Bearer <nap_key>
 *
 * The dialog flow nodes use sourcePreference:"docs-only" — they read
 * from the `documents` array in the request body, not from messages.
 *
 * PDFs are parsed client-side with pdfjs-dist to extract clean text
 * before sending (FileReader.readAsText produces binary garbage).
 *
 * In local dev, Vite proxies /oj-api → https://api.openjustice.ai.
 * In production, server.js proxies the same path with Express.
 *
 * Required env vars:
 *   VITE_OPENJUSTICE_API_KEY   → nap_...
 *   VITE_OPENJUSTICE_FLOW_ID   → UUID of your dialog flow (optional)
 *   VITE_OPENJUSTICE_MODEL     → optional, defaults to claude-sonnet-4-5
 */

import * as pdfjsLib from "pdfjs-dist";

// Point the worker at the bundled worker shipped with pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const API_KEY = import.meta.env.VITE_OPENJUSTICE_API_KEY as string;
const FLOW_ID =
  (import.meta.env.VITE_OPENJUSTICE_FLOW_ID as string) ||
  "39be0734-55e5-4930-acc7-cc6f7c42bd52";
const MODEL =
  (import.meta.env.VITE_OPENJUSTICE_MODEL as string) || "claude-sonnet-4-5";

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

// ─── PDF extraction ───────────────────────────────────────────────────────────

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    pages.push(pageText);
  }
  return pages.join("\n\n");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

function buildBody(
  content: string,
  documents: Array<{ name: string; content: string }>
): string {
  return JSON.stringify({
    dialogFlowId: FLOW_ID,
    model: MODEL,
    messages: [{ content }],
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
  const res = await fetch(ENDPOINT, {
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
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: headers(),
    body: buildBody(
      `Analyse ce contrat de travail: ${file.name}`,
      [{ name: file.name, content: text }]
    ),
  });
  return handleResponse(res);
}
