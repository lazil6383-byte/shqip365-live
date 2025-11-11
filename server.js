import express from "express";
import fetch from "node-fetch";
import https from "https";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Merr çelësat nga Render (Environment Variable FD_KEYS)
const apiKeys = process.env.FD_KEYS ? process.env.FD_KEYS.split(",") : [];
let currentKeyIndex = 0;

// Funksion për të ndërruar automatikisht API key nëse njëra dështon
async function fetchWithRotation(url, headers) {
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[currentKeyIndex];
    try {
      const response = await fetch(url, {
        headers: { ...headers, "X-Auth-Token": key },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.log(`⚠️ API Key ${key} dështoi (${response.status}), po kaloj te tjetra...`);
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      }
    } catch (error) {
      console.error("❌ Gabim gjatë fetch:", error.message);
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }
  }
  throw new Error("Të gjitha API keys dështuan");
}

// Endpoint kryesor për ndeshjet
app.get("/matches", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const url = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`;
    let data = await fetchWithRotation(url, {});

    // Nëse nuk ka ndeshje, përdor backup API-n
    if (!data.matches || data.matches.length === 0) {
      console.log("⚽ Nuk u gjetën ndeshje nga football-data.org, po përdor TheSportsDB...");
      const backupUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`;
      const backup = await fetch(backupUrl);
      data = await backup.json();
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Gabim tek /matches:", error.message);
    res.status(500).json({ error: "Gabim gjatë ngarkimit nga API-t." });
  }
});

// --- Shërbe front-end-in ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Keep alive ping për Render
const SELF_URL = "https://shqip365-live.onrender.com";
setInterval(() => {
  https.get(SELF_URL, (res) => {
    console.log("⏱ Ping:", res.statusCode);
  }).on("error", (err) => console.error("Ping error:", err.message));
}, 9 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Shqip365 running on port ${PORT}`);
});
