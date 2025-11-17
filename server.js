import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Fix __dirname për ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// ===============================
//   API 1 – FUTBOLL LIVE
// ===============================
app.get("/api/live", async (req, res) => {
  try {
    const url = "https://www.scorebat.com/video-api/v3/feed/?type=football-live";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const data = await response.json();

    const formatted = (data.response || []).map((m) => ({
      league: m.competition,
      home: m.title.split(" vs ")[0]?.trim() || "",
      away: m.title.split(" vs ")[1]?.trim() || "",
      date: m.date,
      time: "LIVE",
      score: "",
      live: true,
      odds: null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("LIVE API ERROR:", err);
    res.status(500).json({ error: "Error loading live football" });
  }
});


// ===============================
//   API 2 – FUTBOLL ALL MATCHES
// ===============================
app.get("/api/matches", async (req, res) => {
  try {
    const url =
      "https://www.scorebat.com/video-api/v3/feed/?type=football";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const data = await response.json();

    const formatted = (data.response || []).map((m) => ({
      league: m.competition,
      home: m.title.split(" vs ")[0]?.trim(),
      away: m.title.split(" vs ")[1]?.trim(),
      date: m.date,
      time: "",
      score: "",
      live: false,
      odds: null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("MATCHES API ERROR:", err);
    res.status(500).json({ error: "Error loading matches" });
  }
});


// ===============================
//   FRONTEND
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ===============================
//   START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Shqip365 API running on port ${PORT}`);
});
