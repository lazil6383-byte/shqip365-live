import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const API_KEY = process.env.SPORTMONKS_API_KEY;
const BASE_URL = "https://api.sportmonks.com/v3/football";

// Ligat kryesore evropiane për t'i marrë të gjitha ndeshjet
const LEAGUES = [
  8,   // Champions League
  82,  // Europa League
  301, // Premier League
  302, // La Liga
  303, // Serie A
  304, // Bundesliga
  307, // Ligue 1
  362, // Eredivisie
  384  // Liga Portugal
];

// -------------------------
// Funksion universal për marrje të dhënash
// -------------------------
async function fetchMatches(status) {
  try {
    const url = `${BASE_URL}/fixtures?api_token=${API_KEY}&include=scores;participants;league&filters=status:${status};league_id:${LEAGUES.join(",")}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.data || [];
  } catch (err) {
    console.error("Gabim gjatë marrjes së ndeshjeve:", err);
    return [];
  }
}

// -------------------------
// ENDPOINT – LIVE MATCHES
// -------------------------
app.get("/api/live", async (req, res) => {
  const matches = await fetchMatches("live");
  res.json(matches);
});

// -------------------------
// ENDPOINT – UPCOMING
// -------------------------
app.get("/api/upcoming", async (req, res) => {
  const matches = await fetchMatches("not_started");
  res.json(matches);
});

// -------------------------
// ENDPOINT – FINISHED
// -------------------------
app.get("/api/finished", async (req, res) => {
  const matches = await fetchMatches("finished");
  res.json(matches);
});

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
