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


// =========================
//       TEST ROUTE
// =========================

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working 🚀" });
});


// =========================
//   LIVE MATCHES ROUTE
// =========================

app.get("/api/live", async (req, res) => {
  try {
    const API_KEY = process.env.SPORTMONKS_API_KEY;

    const url = `https://api.sportmonks.com/v3/football/livescores?api_token=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error getting livescores" });
  }
});


// =========================
//     ALL EUROPEAN LEAGUES
// =========================

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
      301, // Primeira Liga
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


// =========================
//     MATCHES BY LEAGUE
// =========================
// Example: /api/matches/8  → Premier League

app.get("/api/matches/:leagueId", async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    const API_KEY = process.env.SPORTMONKS_API_KEY;

    const url = `https://api.sportmonks.com/v3/football/fixtures/by-league/${leagueId}?api_token=${API_KEY}&include=scores;participants;state`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching matches by league" });
  }
});


// =========================
//     DEFAULT ROUTE
// =========================

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// =========================
//       START SERVER
// =========================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
