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

// ✅ Rrugë për marrjen e ndeshjeve (me proxy)
app.get("/api/matches", async (req, res) => {
  const status = req.query.status || "SCHEDULED";
  const dateFrom = new Date().toISOString().split("T")[0];
  const dateTo = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  try {
    // ✅ Proxy për të shmangur bllokimin e API-së
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=${status}`
    )}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "shqip365-live" },
    });

    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);

    res.json(data);
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së ndeshjeve:", err);
    res.status(500).json({ error: "Gabim gjatë komunikimit me API-në" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
