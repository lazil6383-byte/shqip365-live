import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ API nga football-data.org (token yt personal)
const API_TOKEN = "7340eeb21f7242de84d5b3bfdf6ac453";

app.use(cors());
app.use(express.static("public"));

// Cache i brendshëm për të kursyer kërkesat
let cache = { matches: [], updated: 0 };

// Funksion për marrjen e të dhënave nga API
async function getMatches() {
  const now = Date.now();
  if (now - cache.updated < 120000) return cache.matches; // rifreskim çdo 2 min

  const res = await fetch("https://api.football-data.org/v4/matches", {
    headers: { "X-Auth-Token": API_TOKEN }
  });

  if (!res.ok) throw new Error("Gabim gjatë marrjes së të dhënave nga API");
  const data = await res.json();
  cache = { matches: data.matches || [], updated: now };
  return cache.matches;
}

// 🔴 LIVE
app.get("/api/live", async (req, res) => {
  try {
    const matches = await getMatches();
    const live = matches.filter(m =>
      ["IN_PLAY", "PAUSED"].includes(m.status)
    );
    res.json({ matches: live });
  } catch (err) {
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve live" });
  }
});

// 🕒 SË SHPEJTI
app.get("/api/upcoming", async (req, res) => {
  try {
    const matches = await getMatches();
    const upcoming = matches.filter(m => m.status === "SCHEDULED");
    res.json({ matches: upcoming });
  } catch (err) {
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve së shpejti" });
  }
});

// ✅ PËRFUNDUAR
app.get("/api/finished", async (req, res) => {
  try {
    const matches = await getMatches();
    const finished = matches.filter(m => m.status === "FINISHED");
    res.json({ matches: finished });
  } catch (err) {
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve përfunduar" });
  }
});

// Kontroll shëndeti
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    updated: new Date(cache.updated).toLocaleTimeString(),
    total: cache.matches.length
  });
});

// Starto serverin
app.listen(PORT, () =>
  console.log(`✅ Shqip365 Live po punon në portin ${PORT}`)
);
