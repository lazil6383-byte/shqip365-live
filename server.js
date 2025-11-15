// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Fix për __dirname në ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ====== Sofascore API – LIVE FOOTBALL ======
const SOFA_URL = "https://api.sofascore.com/api/v1/sport/football/events/live";

// Convertojmë të dhënat e Sofascore në formatin që përdor faqja jote
function convertMatch(m) {
  return {
    league: m.tournament?.name || "Unknown League",
    date: new Date(m.startTimestamp * 1000).toDateString(),
    home: m.homeTeam?.name || "Home",
    away: m.awayTeam?.name || "Away",
    time: m.time?.currentPeriodStartTimestamp
      ? `${m.time?.minute}'`
      : "—",
    score: m.homeScore && m.awayScore
      ? `${m.homeScore.current} - ${m.awayScore.current}`
      : "",
    live: m.status?.type === "inprogress",
    odds: null // Sipas kërkesës: FUTBOLL vetem realtime
  };
}

// ====== API endpoint /api/matches ======
app.get("/api/matches", async (req, res) => {
  try {
    const response = await fetch(SOFA_URL);
    const json = await response.json();

    const events = json.events || [];

    // Convertojmë të gjithë eventet
    const formatted = events.map(convertMatch);

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching Sofascore:", err);
    res.status(500).json({ error: "Failed to load live data" });
  }
});

// ====== FRONTEND ======
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====== START ======
app.listen(PORT, () => {
  console.log(`Shqip365 LIVE running on port ${PORT}`);
});
