import express from "express";
import fetch from "node-fetch";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ API-ja jote personale nga football-data.org
const FOOTBALL_KEY = "7340eeb21f7242de84d5b3bfdf6ac453";

// Kjo lejon serverin të lexojë skedarët në folderin "public"
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// ✅ Rruga për testim të serverit
app.get("/api/health", async (req, res) => {
  try {
    const resp = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": FOOTBALL_KEY },
    });
    const data = await resp.json();
    res.json({
      ok: true,
      total: data.count || 0,
      updated: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ Rruga për të marrë ndeshjet live
app.get("/api/live", async (req, res) => {
  try {
    const resp = await fetch("https://api.football-data.org/v4/matches?status=LIVE", {
      headers: { "X-Auth-Token": FOOTBALL_KEY },
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Rruga për ndeshjet që do të fillojnë (Upcoming)
app.get("/api/upcoming", async (req, res) => {
  try {
    const resp = await fetch("https://api.football-data.org/v4/matches?status=SCHEDULED", {
      headers: { "X-Auth-Token": FOOTBALL_KEY },
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Rruga për ndeshjet e përfunduara
app.get("/api/finished", async (req, res) => {
  try {
    const resp = await fetch("https://api.football-data.org/v4/matches?status=FINISHED", {
      headers: { "X-Auth-Token": FOOTBALL_KEY },
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Kjo bën që çdo faqe tjetër të çojë te index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Niset serveri
app.listen(PORT, () => console.log(`✅ Shqip365 Live running on port ${PORT}`));
