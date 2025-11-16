// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Fix dirname për ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Sofascore URL
const SOFA_URL =
  "https://api.sofascore.com/api/v1/sport/football/events/live";

// Convertim Sofa → Shqip365 format
function convertMatch(m) {
  return {
    league: m.tournament?.name || "Unknown League",
    date: new Date(m.startTimestamp * 1000).toDateString(),
    home: m.homeTeam?.name || "Home",
    away: m.awayTeam?.name || "Away",
    time: m.time?.minute ? `${m.time.minute}'` : "—",
    score:
      m.homeScore && m.awayScore
        ? `${m.homeScore.current} - ${m.awayScore.current}`
        : "",
    live: m.status?.type === "inprogress",
    odds: null,
  };
}

// API – /api/matches
app.get("/api/matches", async (req, res) => {
  try {
    const response = await fetch(SOFA_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(500).json({
        error: "Sofascore blocked request",
        status: response.status,
      });
    }

    const json = await response.json();
    const events = json.events || [];

    const formatted = events.map(convertMatch);

    res.json({
      count: formatted.length,
      matches: formatted,
    });
  } catch (err) {
    console.error("Sofa ERROR:", err);
    res.status(500).json({ error: "Server error fetching data" });
  }
});

// Frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start
app.listen(PORT, () => {
  console.log(`Shqip365 LIVE running on port ${PORT}`);
});
