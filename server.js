import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// API LIVE — SCOREBAT
const LIVE_API = "https://www.scorebat.com/video-api/v3/feed/?token=demo";

// API MATCHES — BACKUP (ditore)
const MATCHES_API = "https://livescore-api.vercel.app/matches";

app.get("/", (req, res) => {
  res.send({ status: "API running" });
});

// ======================
//        LIVE
// ======================
app.get("/live", async (req, res) => {
  try {
    const response = await fetch(LIVE_API);
    if (!response.ok) {
      return res.status(500).json({ error: "Live API error" });
    }

    const data = await response.json();

    // Filtrim LIVE
    const liveMatches = data.response.filter(
      (m) => m.matchview?.status === "LIVE"
    );

    res.json({ live: liveMatches });
  } catch (err) {
    res.status(500).json({ error: "Error fetching live data" });
  }
});

// ======================
//     MATCHES TODAY
// ======================
app.get("/matches", async (req, res) => {
  try {
    const response = await fetch(MATCHES_API);

    if (!response.ok) {
      return res.status(500).json({ error: "Matches API error" });
    }

    const data = await response.json();
    res.json({ matches: data.data || [] });
  } catch (err) {
    res.status(500).json({ error: "Error fetching matches" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
