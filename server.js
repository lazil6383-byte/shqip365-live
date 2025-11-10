import express from "express";
import fetch from "node-fetch";
import https from "https";
import cors from "cors";

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
    const url = "https://api.football-data.org/v4/matches";
    const data = await fetchWithRotation(url, {});
    res.json(data);
  } catch (error) {
    console.error("❌ Gabim tek /matches:", error.message);

    // Backup — TheSportsDB
    try {
      const backupUrl = "https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=2025-11-11&s=Soccer";
      const backup = await fetch(backupUrl);
      const backupData = await backup.json();
      res.json(backupData);
    } catch (e) {
      res.status(500).json({ error: "Gabim gjatë ngarkimit nga API-t." });
    }
  }
});

// Keep alive ping për ta mbajtur Render 24/7 aktiv
const SELF_URL = "https://shqip365-live.onrender.com";
setInterval(() => {
  https.get(SELF_URL, (res) => {
    console.log("⏱ Ping:", res.statusCode);
  }).on("error", (err) => console.error("Ping error:", err.message));
}, 9 * 60 * 1000); // çdo 9 minuta

// Start server
app.listen(PORT, () => {
  console.log(`✅ Shqip365 running on port ${PORT}`);
});
