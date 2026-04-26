import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

// Proxy /oj-api → Open Justice API (hides API key, bypasses CORS)
app.use("/oj-api", async (req, res) => {
  const apiKey =
    process.env.OPENJUSTICE_API_KEY ||
    process.env.VITE_OPENJUSTICE_API_KEY ||
    "";
  try {
    const upstream = `https://api.openjustice.ai${req.path}`;
    const response = await fetch(upstream, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
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
