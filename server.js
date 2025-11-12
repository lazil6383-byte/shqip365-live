import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API = process.env.SPORTMONKS_API_KEY;

// Aktivizo CORS për frontend
app.use(cors());

// 🏆 Lista e ligave të mëdha evropiane dhe botërore (me ID nga SportMonks)
const LEAGUE_IDS = [
  8,   // Premier League (England)
  564, // La Liga (Spain)
  384, // Serie A (Italy)
  82,  // Bundesliga (Germany)
  301, // Ligue 1 (France)
  2,   // Champions League
  3,   // Europa League
  7,   // Conference League
  179, // Eredivisie (Netherlands)
  501, // Portuguese Liga
  383, // Turkish Super Lig
  19686, // Swiss Super League
  501, // Portuguese Primeira Liga
  480, // Scottish Premiership
  566, // Belgian Pro League
  362, // Danish Superliga
  108, // Greek Super League
  384, // Italian Serie A (duplicate to ensure fallback)
];

// 🕒 Middleware për logim
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ✅ Endpoint për ndeshjet live
app.get("/api/live", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/livescores?api_token=${API}&include=participants;league;score;events`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching live matches:", error);
    res.status(500).json({ error: "Failed to fetch live matches" });
  }
});

// 🗓️ Endpoint për ndeshjet e ardhshme (Next 3 days)
app.get("/api/upcoming", async (req, res) => {
  try {
    const leagueIds = LEAGUE_IDS.join(",");
    const url = `https://api.sportmonks.com/v3/football/fixtures/between/${getToday()}/${getFuture(3)}?api_token=${API}&filters=league_id:${leagueIds}&include=participants;league;score`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching upcoming matches:", error);
    res.status(500).json({ error: "Failed to fetch upcoming matches" });
  }
});

// 🕰️ Endpoint për ndeshjet e përfunduara (Last 3 days)
app.get("/api/finished", async (req, res) => {
  try {
    const leagueIds = LEAGUE_IDS.join(",");
    const url = `https://api.sportmonks.com/v3/football/fixtures/between/${getPast(3)}/${getToday()}?api_token=${API}&filters=league_id:${leagueIds}&include=participants;league;score`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching finished matches:", error);
    res.status(500).json({ error: "Failed to fetch finished matches" });
  }
});

// 🧭 Endpoint për një ligë të caktuar (me ID)
app.get("/api/league/:id", async (req, res) => {
  const leagueId = req.params.id;
  try {
    const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${API}&filters=league_id:${leagueId}&include=participants;league;score;venue`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching league data:", error);
    res.status(500).json({ error: "Failed to fetch league data" });
  }
});

// 📅 Funksione ndihmëse për datat
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getFuture(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getPast(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Shqip365 server po punon në portin ${PORT}`);
});
