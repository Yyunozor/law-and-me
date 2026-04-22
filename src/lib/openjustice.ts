/**
 * Open Justice API Client
 *
 * TODO: Remplacer OPENJUSTICE_API_URL par le vrai endpoint une fois connu.
 *       L'URL exacte se trouve dans les settings de ton compte Open Justice
 *       ou dans la documentation de la plateforme (onglet "API" / "Intégrations").
 *
 * Variables d'environnement à définir dans Replit (Secrets) :
 *   VITE_OPENJUSTICE_API_KEY  → la clé privée nap_2d25...
 *   VITE_OPENJUSTICE_API_URL  → l'endpoint de base (ex: https://openjustice.ai/api/v1)
 */

const API_KEY = import.meta.env.VITE_OPENJUSTICE_API_KEY as string;
const API_BASE = (import.meta.env.VITE_OPENJUSTICE_API_URL as string) || "https://openjustice.ai/api/v1";

// Nom exact du flow tel qu'il apparaît sur la plateforme Open Justice
const FLOW_NAME = "Projet (Ne pas modifier)";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClauseResult {
  label: string;
  status: "conforme" | "attention" | "illegal" | "info";
  detail: string;
}

export interface AnalysisResult {
  /** Avis de droit final généré par le nœud Outcome */
  opinion: string;
  /** Résultats structurés par clause (si l'API les retourne séparément) */
  clauses?: ClauseResult[];
  /** Réponse brute de l'API (fallback) */
  raw?: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${API_KEY}`,
  };
}

async function handleResponse(res: Response): Promise<unknown> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Open Justice API ${res.status}: ${body || res.statusText}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  // Certaines APIs retournent du markdown/texte brut
  return { opinion: await res.text() };
}

/** Normalise la réponse brute en AnalysisResult */
function normalizeResult(raw: unknown): AnalysisResult {
  if (typeof raw === "string") {
    return { opinion: raw, raw };
  }
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    // Formats connus : { opinion }, { result }, { output }, { text }, { content }
    const opinion =
      (r.opinion as string) ||
      (r.result as string) ||
      (r.output as string) ||
      (r.text as string) ||
      (r.content as string) ||
      JSON.stringify(raw, null, 2);
    return { opinion, clauses: r.clauses as ClauseResult[] | undefined, raw };
  }
  return { opinion: String(raw), raw };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Analyse un contrat fourni sous forme de texte brut.
 */
export async function analyzeContractText(text: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/run`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      flowName: FLOW_NAME,
      input: { document: text },
    }),
  });
  const raw = await handleResponse(res);
  return normalizeResult(raw);
}

/**
 * Analyse un contrat fourni sous forme de fichier PDF.
 * L'API reçoit le fichier en multipart/form-data.
 */
export async function analyzeContractFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("flowName", FLOW_NAME);

  const res = await fetch(`${API_BASE}/run`, {
    method: "POST",
    headers: authHeaders(), // pas de Content-Type → le browser le set automatiquement avec boundary
    body: formData,
  });
  const raw = await handleResponse(res);
  return normalizeResult(raw);
}
