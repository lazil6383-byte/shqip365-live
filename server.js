import express from "express";
import axios from "axios";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import NodeCache from "node-cache";
import path from "path";
import { fileURLToPath } from "url";

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "public")));

const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

/* ---------------- API Providers ---------------- */

// 1) Football-Data.org (me keys – stabil & i saktë, por me pak liga në free)
const FD_BASE = "https://api.football-data.org/v4";
const FD_KEYS = (
  process.env.FD_KEYS ||
  "c639ca3a6c0a4e2cd8ee3862daabf67f,ce4ba1190d3445d0b7cc0ac80f092ef6"
).split(",").map(s => s.trim()).filter(Boolean);
let fdIndex = 0;
const nextKey = () => { fdIndex = (fdIndex + 1) % FD_KEYS.length; };

// 2) TheSportsDB (falas – shumë liga; pa key përdorim “demo key 3”)
const TSD_BASE = "https://www.thesportsdb.com/api/v1/json/3";

/* ---------------- Helpers ---------------- */

async function axiosTry(fn) {
  try { return await fn(); } catch (e) { return { error: e }; }
}

function standardizeFDMatches(fd) {
  // Kthen objekt standard { league, utcDate, status, home, away, score }
  if (!fd?.matches) return [];
  return fd.matches.map(m => ({
    provider: "FD",
    league: m.competition?.name || "Unknown",
    country: m.area?.name || "",
    utcDate: m.utcDate,
    status: m.status, // LIVE, FINISHED, SCHEDULED
    minute: m.minute || null,
    home: m.homeTeam?.name,
    away: m.awayTeam?.name,
    score: {
      fullTime: m.score?.fullTime || {},
      halfTime: m.score?.halfTime || {},
      winner: m.score?.winner || null
    }
  }));
}

function standardizeTSDay(dayObj) {
  // events from eventsday.php
  const events = dayObj?.events || [];
  return events.map(ev => ({
    provider: "TSD",
    league: ev.strLeague || "Unknown",
    country: ev.strCountry || "",
    utcDate: ev.dateEvent && ev.strTime
      ? new Date(`${ev.dateEvent}T${ev.strTime}:00Z`).toISOString()
      : ev.dateEvent ? new Date(`${ev.dateEvent}T00:00:00Z`).toISOString() : null,
    status: ev.intHomeScore == null && ev.intAwayScore == null ? "SCHEDULED" : "FINISHED",
    home: ev.strHomeTeam,
    away: ev.strAwayTeam,
    score: {
      fullTime: {
        home: ev.intHomeScore != null ? Number(ev.intHomeScore) : null,
        away: ev.intAwayScore != null ? Number(ev.intAwayScore) : null
      }
    }
  }));
}

function groupByLeague(list) {
  const map = {};
  list.forEach(m => {
    const key = `${m.country} • ${m.league}`.trim();
    if (!map[key]) map[key] = [];
    map[key].push(m);
  });
  // sort by time asc
  Object.values(map).forEach(arr => arr.sort((a,b)=>new Date(a.utcDate)-new Date(b.utcDate)));
  return Object.entries(map).map(([league, matches]) => ({ league, matches }));
}

/* ---------------- Football-Data fetch with rotation ---------------- */
async function fdFetch(path) {
  // cache
  const ck = `fd:${path}`;
  const hit = cache.get(ck);
  if (hit) return hit;

  for (let i = 0; i < FD_KEYS.length; i++) {
    const key = FD_KEYS[fdIndex];
    const res = await axiosTry(() =>
      axios.get(`${FD_BASE}${path}`, { headers: { "X-Auth-Token": key }, timeout: 10000 })
    );
    if (!res.error) {
      cache.set(ck, res.data, 20);
      return res.data;
    }
    const code = res.error?.response?.status;
    if (code === 401 || code === 403 || code === 429) nextKey(); // ndërrim key
  }
  return null;
}

/* ---------------- TheSportsDB fetch (free) ---------------- */
async function tsdFetchDay(dateISO) {
  const d = dateISO.slice(0,10);
  const ck = `tsd:day:${d}`;
  const hit = cache.get(ck);
  if (hit) return hit;

  const res = await axiosTry(() =>
    axios.get(`${TSD_BASE}/eventsday.php`, { params: { d, s: "Soccer" }, timeout: 12000 })
  );
  if (!res.error) {
    cache.set(ck, res.data, 120);
    return res.data;
  }
  return null;
}

/* ---------------- Combined Endpoints ---------------- */

// LIVE
app.get("/api/live", async (req, res) => {
  try {
    const fd = await fdFetch("/matches?status=LIVE");
    const fdStd = standardizeFDMatches(fd);
    // TheSportsDB nuk ka endpoint të qëndrueshëm publik për LIVE pa key — ndaj live kryesisht nga FD
    return res.json({ ok: true, source: "FD", groups: groupByLeague(fdStd) });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "LIVE_FETCH_FAILED" });
  }
});

// SCHEDULED (Së Shpejti) – sot & nesër nga TSD + FD
app.get("/api/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const iso = today.toISOString();
    const tomorrow = new Date(today.getTime() + 24*3600*1000).toISOString();

    const [fd, tsdToday, tsdTomorrow] = await Promise.all([
      fdFetch(`/matches?status=SCHEDULED&dateFrom=${iso.slice(0,10)}&dateTo=${tomorrow.slice(0,10)}`),
      tsdFetchDay(iso),
      tsdFetchDay(tomorrow)
    ]);

    const list = [
      ...standardizeFDMatches(fd || {}),
      ...standardizeTSDay(tsdToday || {}),
      ...standardizeTSDay(tsdTomorrow || {}),
    ];

    // filtro vetëm të ardhshme
    const now = Date.now();
    const upcoming = list.filter(m => m.utcDate && new Date(m.utcDate).getTime() >= now);
    res.json({ ok: true, groups: groupByLeague(upcoming) });
  } catch (e) {
    res.status(500).json({ ok: false, error: "UPCOMING_FETCH_FAILED" });
  }
});

// FINISHED – dje & sot
app.get("/api/finished", async (req, res) => {
  try {
    const today = new Date();
    const iso = today.toISOString();
    const yesterday = new Date(today.getTime() - 24*3600*1000).toISOString();

    const [fd, tsdToday, tsdYesterday] = await Promise.all([
      fdFetch(`/matches?status=FINISHED&dateFrom=${yesterday.slice(0,10)}&dateTo=${iso.slice(0,10)}`),
      tsdFetchDay(iso),
      tsdFetchDay(yesterday)
    ]);

    const list = [
      ...standardizeFDMatches(fd || {}),
      ...standardizeTSDay(tsdToday || {}),
      ...standardizeTSDay(tsdYesterday || {}),
    ];

    const finished = list.filter(m => m.status === "FINISHED");
    // rendit nga më e reja
    finished.sort((a,b)=>new Date(b.utcDate)-new Date(a.utcDate));
    res.json({ ok: true, groups: groupByLeague(finished) });
  } catch (e) {
    res.status(500).json({ ok: false, error: "FINISHED_FETCH_FAILED" });
  }
});

// Health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, fdKeyInUse: fdIndex+1, fdKeysTotal: FD_KEYS.length, tsd: "on" });
});

// SPA support (serve index.html)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Shqip365 po dëgjon në port ${PORT}`);
});
