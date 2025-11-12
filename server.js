import express from "express";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1000;

// Fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// =============================
// TEST
// =============================
app.get("/api/test", (req, res) => {
  res.json({ message: "API working 🚀" });
});

// =============================
// LIVE MATCHES
// =============================
app.get("/api/live", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/livescores?api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ sportmonks: data });
  } catch (err) {
    res.status(500).json({ error: "Live error" });
  }
});

// =============================
// UPCOMING MATCHES
// =============================
app.get("/api/upcoming", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/fixtures/upcoming?api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ sportmonks: data });
  } catch (err) {
    res.status(500).json({ error: "Upcoming error" });
  }
});

// =============================
// FINISHED MATCHES
// =============================
app.get("/api/finished", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/fixtures/finished?api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ sportmonks: data });
  } catch (err) {
    res.status(500).json({ error: "Finished error" });
  }
});

// =============================
// ALL MATCHES TODAY
// =============================
app.get("/api/matches", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${process.env.SPORTMONKS_API_KEY}&include=scores;participants;state;league;time&date=today`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ sportmonks: data });
  } catch (err) {
    res.status(500).json({ error: "Matches error" });
  }
});

// =============================
// EUROPEAN LEAGUES
// =============================
app.get("/api/leagues", async (req, res) => {
  try {
    const leagueIds = [
      8, 564, 384, 82, 301,
      2, 5, 6, 88, 271, 144, 571
    ];

    const url = `https://api.sportmonks.com/v3/football/leagues/multi/${leagueIds.join(",")}?api_token=${process.env.SPORTMONKS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ sportmonks: data });
  } catch (err) {
    res.status(500).json({ error: "Leagues error" });
  }
});

// =============================
// MATCHES BY LEAGUE ID
// =============================
app.get("/api/matches/:leagueId", async (req, res) => {
  try {
    const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${process.env.SPORTMONKS_API_KEY}&filters=league_id:${req.params.leagueId}&include=scores;participants;state;league;time`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ sportmonks: data });
  } catch (err) {
    res.status(500).json({ error: "League matches error" });
  }
});

// FALLBACK
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// START
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
