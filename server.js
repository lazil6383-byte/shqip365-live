import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ============================
//       API SOURCES
// ============================

// LIVE — shpejt, real-time
const LIVE_API = "https://livescore-api.vercel.app/matches";

// UPCOMING — të sakta me orar
const UPCOMING_API = "https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=2025-11-13&s=Soccer";

// FINISHED — të sakta dhe të ruajtura
const FINISHED_API = "https://www.scorebat.com/video-api/v3/feed/?token=demo";


// ============================
//       ROUTE TEST
// ============================
app.get("/", (req, res) => {
  res.send({ status: "API RUNNING ✔️" });
});


// ============================
//       LIVE MATCHES
// ============================
app.get("/live", async (req, res) => {
  try {
    const r = await fetch(LIVE_API);
    const j = await r.json();

    const live = j.data?.filter(m =>
      String(m.status).toUpperCase().includes("LIVE")
    ) || [];

    res.json({ live });
  } catch (err) {
    res.json({ live: [] });
  }
});


// ============================
//       UPCOMING MATCHES
// ============================
app.get("/upcoming", async (req, res) => {
  try {
    const r = await fetch(UPCOMING_API);
    const j = await r.json();

    res.json({ upcoming: j.events || [] });
  } catch (err) {
    res.json({ upcoming: [] });
  }
});


// ============================
//       FINISHED MATCHES
// ============================
app.get("/finished", async (req, res) => {
  try {
    const r = await fetch(FINISHED_API);
    const j = await r.json();

    const finished = j.response || [];

    res.json({ finished });
  } catch (err) {
    res.json({ finished: [] });
  }
});


// ============================
//       START SERVER
// ============================
app.listen(PORT, () => console.log("SERVER RUNNING ON " + PORT));
