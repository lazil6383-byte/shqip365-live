import express from "express";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1000;

// Fix për __dirname në ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shërbe folderin public
app.use(express.static(path.join(__dirname, "public")));


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
    const API_KEY = process.env.SPORTMONKS_API_KEY;

    const url = `https://api.sportmonks.com/v3/football/livescores?api_token=${API_KEY}&include=scores;participants;state`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});


// =============================
// 🟢 2. ALL MATCHES TODAY
// =============================
app.get("/api/matches", async (req, res) => {
  try {
    const API_KEY = process.env.SPORTMONKS_API_KEY;

    const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${API_KEY}&include=scores;participants;state&date=today`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching matches" });
  }
});


// =============================
// 🟢 3. UPCOMING MATCHES (Së Shpejti)
// =============================
app.get("/api/upcoming", async (req, res) => {
  try {
    const API_KEY = process.env.SPORTMONKS_API_KEY;

    const url = `https://api.sportmonks.com/v3/football/fixtures/upcoming?api_token=${API_KEY}&include=scores;participants;state`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching upcoming matches" });
  }
});


// =============================
// 🟢 4. FINISHED MATCHES (Përfunduara)
// =============================
app.get("/api/finished", async (req, res) => {
  try {
    const API_KEY = process.env.SPORTMONKS_API_KEY;

    const url = `https://api.sportmonks.com/v3/football/fixtures/finished?api_token=${API_KEY}&include=scores;participants;state`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching finished matches" });
  }
});


// =============================
// 🟢 5. EUROPEAN LEAGUES
// =============================
app.get("/api/leagues", async (req, res) => {
  try {
    const API_KEY = process.env.SPORTMONKS_API_KEY;

    const leagueIds = [
      8,   // Premier League
      564, // La Liga
      384, // Serie A
      82,  // Bundesliga
      301, // Ligue 1
      2,   // Champions League
      5,   // Europa League
      6,   // Conference League
      88,  // Eredivisie
      271, // Primeira Liga
      144, // Belgian Pro League
      571  // Greek Super League
    ];

    const url = `https://api.sportmonks.com/v3/football/leagues/multi/${leagueIds.join(",")}?api_token=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching leagues" });
  }
});


// =============================
// 🟢 6. MATCHES BY LEAGUE ID
// =============================
app.get("/api/matches/:leagueId", async (req, res) => {
  try {
    const API_KEY = process.env.SPORTMONKS_API_KEY;
    const leagueId = req.params.leagueId;

    const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${API_KEY}&filters=league_id:${leagueId}&include=scores;participants;state`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching league matches" });
  }
});


// =============================
// 🟢 DEFAULT ROUTE → FRONT-END
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
