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

// === Fetch ndeshje sipas statusit ===
app.get("/api/matches", async (req, res) => {
  const status = req.query.status || "SCHEDULED"; // default: ndeshje qe do zhvillohen
  const dateFrom = new Date().toISOString().split("T")[0];
  const dateTo = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // sot + 2 dite

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=${status}`,
      {
        headers: {
          "X-Auth-Token": API_KEY,
          "User-Agent": "shqip365-live"
        }
      }
    );

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      res.json(json);
    } catch {
      console.error("⚠️ Përgjigje jo JSON nga API:", text);
      res.status(500).json({ error: "Gabim gjatë komunikimit me Football-Data" });
    }
  } catch (err) {
    console.error("❌ Gabim gjatë marrjes së ndeshjeve:", err);
    res.status(500).json({ error: "Gabim në server" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
