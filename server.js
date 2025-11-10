import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = "49e8b9175faa444ebe06923fc9b2a81b";

// Zgjidh problem me __dirname për module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/matches", async (req, res) => {
  const status = req.query.status || "LIVE";

  try {
    const response = await fetch(`https://api.football-data.org/v4/matches?status=${status}`, {
      headers: {
        "X-Auth-Token": API_KEY,
        "User-Agent": "shqip365-live-app"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gabim nga API:", errorText);
      return res.status(response.status).json({ error: "Gabim nga API" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gabim gjatë kërkesës:", error);
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
