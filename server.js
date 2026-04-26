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
const FLOW_ID =
  process.env.OPENJUSTICE_FLOW_ID ||
  process.env.VITE_OPENJUSTICE_FLOW_ID ||
  "39be0734-55e5-4930-acc7-cc6f7c42bd52";
const MODEL =
  process.env.OPENJUSTICE_MODEL ||
  process.env.VITE_OPENJUSTICE_MODEL ||
  "claude-sonnet-4-5";

function ojHeaders() {
  const key =
    process.env.OPENJUSTICE_API_KEY ||
    process.env.VITE_OPENJUSTICE_API_KEY ||
    "";
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

// Parse raw SSE text into [{event, data}]
function parseSSE(raw) {
  const events = [];
  let ev = null, dt = null;
  for (const line of raw.split("\n")) {
    if (line.startsWith("event: ")) {
      ev = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      try { dt = JSON.parse(line.slice(6)); } catch { dt = {}; }
    } else if (line.trim() === "" && ev) {
      events.push({ event: ev, data: dt ?? {} });
      ev = null; dt = null;
    }
  }
  return events;
}

// Pick the final analysis text out of SSE events
function extractOpinion(events) {
  for (const { event, data } of events) {
    if (event === "message") {
      if (data.error) throw new Error(data.error);
      if (data.text) return data.text;
    }
    if (event === "node-result" && data.nodeConfig?.type === "reasoning") {
      const out = data.nodeExecutionResults?.output;
      if (out) {
        try {
          const p = JSON.parse(out);
          return p.text || p.content || p.opinion || JSON.stringify(p, null, 2);
        } catch { return out; }
      }
    }
  }
  return null;
}

async function ojStream(conversationId, citationId, fileName, resumeExecutionId) {
  const body = {
    conversationId,
    dialogFlowId: FLOW_ID,
    model: MODEL,
    resources: [{ id: citationId, name: fileName, source: "library" }],
    isWebSearchEnabled: false,
    ...(resumeExecutionId
      ? { resumeExecutionId, message: "true" }
      : { message: "Analyse ce contrat de travail." }),
  };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch(`${OJ_BASE}/conversations/stream`, {
      method: "POST",
      headers: ojHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Stream ${res.status}: ${await res.text()}`);
    return parseSSE(await res.text());
  } finally {
    clearTimeout(t);
  }
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

// Full Open Justice conversation flow → JSON opinion
app.post("/api/analyze-contract", async (req, res) => {
  const { text, fileName = "contrat.txt" } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    // 1. Upload document text to file library
    const citRes = await fetch(`${OJ_BASE}/file-library/citations/pasted`, {
      method: "POST",
      headers: ojHeaders(),
      body: JSON.stringify({ fileName, textContent: text }),
    });
    if (!citRes.ok) throw new Error(`Citation upload: ${await citRes.text()}`);
    const { id: citationId } = await citRes.json();

    // 2. Create conversation
    const convRes = await fetch(`${OJ_BASE}/conversations`, {
      method: "POST",
      headers: ojHeaders(),
      body: JSON.stringify({ dialogFlowId: FLOW_ID }),
    });
    if (!convRes.ok) throw new Error(`Conversation: ${await convRes.text()}`);
    const { conversationId } = await convRes.json();

    // 3. First stream pass
    const events1 = await ojStream(conversationId, citationId, fileName);
    const opinion1 = extractOpinion(events1);
    if (opinion1) return res.json({ opinion: opinion1 });

    // 4. Auto-resume if fact node asked for user input
    const awaiting = events1.find((e) => e.event === "awaiting-user-input");
    const started = events1.find((e) => e.event === "execution-started");
    if (awaiting && started?.data?.executionId) {
      const events2 = await ojStream(
        conversationId,
        citationId,
        fileName,
        started.data.executionId
      );
      const opinion2 = extractOpinion(events2);
      if (opinion2) return res.json({ opinion: opinion2 });
    }

    throw new Error("Aucun résultat reçu du dialog flow.");
  } catch (err) {
    const msg = String(err);
    const friendly = msg.includes("credit balance")
      ? "Quota journalier Open Justice épuisé — les crédits se rechargent chaque jour. Réessayez dans quelques heures."
      : msg.includes("aborted") || msg.includes("AbortError")
      ? "L'analyse a pris trop de temps. Réessayez dans un instant."
      : msg.replace(/^Error: /, "");
    res.status(502).json({ error: friendly });
  }
});

// Proxy /oj-api → Open Justice API (for any direct browser calls)
app.use("/oj-api", async (req, res) => {
  const hdrs = ojHeaders();
  try {
    const upstream = `${OJ_BASE}${req.path}`;
    const response = await fetch(upstream, {
      method: req.method,
      headers: hdrs,
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("text/event-stream")) {
      res.set("Content-Type", "text/event-stream");
      res.set("Cache-Control", "no-cache");
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const text = await response.text();
      res.status(response.status).type("json").send(text);
    }
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
