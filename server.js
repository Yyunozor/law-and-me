import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { extractText } from "unpdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.json({ limit: "10mb" }));

const OJ_BASE = "https://api.openjustice.ai";
const GPT_MODEL = process.env.GPT_MODEL || "gpt-5.4-nano";

function ojKey() {
  return process.env.OPENJUSTICE_API_KEY || process.env.VITE_OPENJUSTICE_API_KEY || "";
}

function ojHeaders() {
  return { Authorization: `Bearer ${ojKey()}`, "Content-Type": "application/json" };
}

// Read SSE stream chunk-by-chunk, stop at "done" event
async function collectSSEText(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let output = "";
  let buffer = "";
  let currentEvent = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
          if (currentEvent === "done") return output.trim();
        } else if (line.startsWith("data: ") && currentEvent === "message") {
          try {
            const d = JSON.parse(line.slice(6));
            if (d.error) throw new Error(d.error);
            if (d.text) output += d.text;
          } catch (e) {
            if (e.message && !e.message.includes("JSON")) throw e;
          }
        } else if (line.trim() === "") {
          currentEvent = null;
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  return output.trim();
}

// Parse a PDF server-side → return plain text
app.post("/api/extract-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const { text } = await extractText(new Uint8Array(req.file.buffer));
    res.json({ text: Array.isArray(text) ? text.join("\n\n") : text });
  } catch (err) {
    res.status(422).json({ error: String(err) });
  }
});

// Analyze a contract via Open Justice plain chat (no dialog flow)
app.post("/api/analyze-contract", async (req, res) => {
  const { text, fileName = "contrat.txt" } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });
  if (!ojKey()) return res.status(500).json({ error: "Clé API Open Justice manquante." });

  const prompt = `Tu es un juriste spécialisé en droit du travail suisse (CO, LTr, CCT).
Analyse le contrat de travail ci-dessous et rédige un avis structuré en français couvrant :

1. **Forme et validité** — mentions obligatoires présentes ou manquantes.
2. **Durée** — déterminée ou indéterminée, période d'essai, délais de résiliation légaux vs contractuels (art. 335c CO).
3. **Salaire et avantages** — conformité, 13e salaire, bonus.
4. **Temps de travail** — durée hebdomadaire, heures supplémentaires, vacances (minimum légal : 4 semaines, art. 329a CO).
5. **Clauses particulières** — non-concurrence, confidentialité, dédit-formation : validité et portée.
6. **Points d'attention** — clauses défavorables ou manquements légaux.
7. **Recommandations** — ce que l'employé devrait négocier ou clarifier avant de signer.

--- CONTRAT (${fileName}) ---

${text}

--- FIN DU CONTRAT ---

Rédige l'analyse complète maintenant.`;

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 90_000);

    let response;
    try {
      response = await fetch(`${OJ_BASE}/conversations/stream`, {
        method: "POST",
        headers: ojHeaders(),
        body: JSON.stringify({ message: prompt, model: GPT_MODEL }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(t);
    }

    if (!response.ok) throw new Error(`OJ ${response.status}: ${await response.text()}`);

    const opinion = await collectSSEText(response);
    if (!opinion) throw new Error("Réponse vide reçue d'Open Justice.");

    res.json({ opinion });
  } catch (err) {
    const msg = String(err);
    const friendly = msg.includes("aborted") || msg.includes("AbortError")
      ? "L'analyse a pris trop de temps. Réessayez."
      : msg.replace(/^Error: /, "");
    res.status(502).json({ error: friendly });
  }
});

// Proxy /oj-api → Open Justice API (gardé pour usage futur)
app.use("/oj-api", async (req, res) => {
  try {
    const response = await fetch(`${OJ_BASE}${req.path}`, {
      method: req.method,
      headers: ojHeaders(),
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });
    const text = await response.text();
    res.status(response.status).type("json").send(text);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

// Serve built frontend
const staticDir = path.join(__dirname, "dist/public");
app.use(express.static(staticDir));
app.get("*", (_, res) =>
  res.sendFile(path.join(staticDir, "index.html"))
);

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Law & Me running on http://0.0.0.0:${PORT}`)
);
