import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = "49e8b9175faa444ebe06923fc9b2a81b";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/matches", async (req, res) => {
  const status = req.query.status || "";

  // Kërko ndeshjet nga 5 ditë më parë deri në 5 ditë pas sot
  const dateFrom = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const dateTo = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    const apiUrl = `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    const response = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": API_KEY,
        "User-Agent": "shqip365-live"
      }
    });

    if (!response.ok) {
      console.error("⚠️ API error:", response.status, response.statusText);
      return res.status(500).json({ error: "Gabim gjatë komunikimit me API-në" });
    }

    const data = await response.json();

    if (!data.matches) {
      console.warn("⚠️ Asnjë ndeshje nuk u kthye nga API.");
      return res.json({ matches: [] });
    }

    // Filtrim sipas statusit nëse kërkohet (LIVE, FINISHED, SCHEDULED)
    const filtered = status ? data.matches.filter(m => m.status === status) : data.matches;

    res.json({ matches: filtered });
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së ndeshjeve:", err);
    res.status(500).json({ error: "Gabim në server" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
