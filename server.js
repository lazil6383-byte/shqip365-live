import express from "express";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1000;

// Fix për __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shërbe frontend
app.use(express.static(path.join(__dirname, "public")));


// ======================================================
// 🔵 HELPER – Normalizojmë SportMonks V3 → V2 FORMAT
// ======================================================
function normalizeV3(api) {
  return {
    data: api.data?.fixtures || api.data || []
  };
}


// =============================
// 🟢 TEST ROUTE
// =============================
app.get("/api/test", (req, res) => {
  res.json({ message: "API working 🚀" });
});


// =============================
// 🟢 1. LIVE MATCHES
// =============================
app.get("/api/live", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/livescores?api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time`;

    const response = await fetch(url);
    const api = await response.json();

    res.json({ sportmonks: normalizeV3(api) });
  } catch (err) {
    console.error("LIVE ERROR:", err);
    res.status(500).json({ error: "Live error" });
  }
});


// =============================
// 🟢 2. UPCOMING MATCHES (Së Shpejti)
// =============================
app.get("/api/upcoming", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/fixtures/upcoming?api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time`;

    const response = await fetch(url);
    const api = await response.json();

    res.json({ sportmonks: normalizeV3(api) });
  } catch (err) {
    console.error("UPCOMING ERROR:", err);
    res.status(500).json({ error: "Upcoming error" });
  }
});


// =============================
// 🟢 3. FINISHED MATCHES
// =============================
app.get("/api/finished", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/fixtures/finished?api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time`;

    const response = await fetch(url);
    const api = await response.json();

    res.json({ sportmonks: normalizeV3(api) });
  } catch (err) {
    console.error("FINISHED ERROR:", err);
    res.status(500).json({ error: "Finished error" });
  }
});


// =============================
// 🟢 4. MATCHES TODAY
// =============================
app.get("/api/matches", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/fixtures?date=today&api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time`;

    const response = await fetch(url);
    const api = await response.json();

    res.json({ sportmonks: normalizeV3(api) });
  } catch (err) {
    console.error("TODAY ERROR:", err);
    res.status(500).json({ error: "Matches today error" });
  }
});


// =============================
// 🟢 5. EUROPEAN LEAGUES LIST
// =============================
app.get("/api/leagues", async (req, res) => {
  try {
    const leagueIds = [
      8,    // Premier League
      564,  // La Liga
      384,  // Serie A
      82,   // Bundesliga
      301,  // Ligue 1
      2,    // Champions League
      5,    // Europa League
      6,    // Conference League
      88,   // Eredivisie
      271,  // Primeira Liga
      144,  // Belgian Pro League
      571   // Greek Super League
    ];

    const url = `https://api.sportmonks.com/v3/football/leagues/multi/${leagueIds.join(",")}?api_token=${process.env.SPORTMONKS_API_KEY}`;

    const response = await fetch(url);
    const leagues = await response.json();

    res.json(leagues);
  } catch (err) {
    console.error("LEAGUES ERROR:", err);
    res.status(500).json({ error: "Leagues error" });
  }
});


// =============================
// 🟢 6. MATCHES BY LEAGUE ID
// =============================
app.get("/api/matches/:leagueId", async (req, res) => {
  try {
    const leagueId = req.params.leagueId;

    const url = `https://api.sportmonks.com/v3/football/fixtures?filters=league_id:${leagueId}&api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time`;

    const response = await fetch(url);
    const api = await response.json();

    res.json({ sportmonks: normalizeV3(api) });
  } catch (err) {
    console.error("MATCHES BY LEAGUE ERROR:", err);
    res.status(500).json({ error: "League matches error" });
  }
});


// =============================
// 🟢 DEFAULT — FRONTEND
// =============================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// =============================
// 🟢 START SERVER
// =============================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
