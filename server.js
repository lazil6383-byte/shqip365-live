import express from "express";
import axios from "axios";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import NodeCache from "node-cache";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Siguri & performance
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "public")));

// Cache në memorie
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

// TheSportsDB (pa key). Live + fixtures për liga kryesore.
// Live (gjithë futbollin): /livescore.php?l=Soccer
const TSD_BASE = "https://www.thesportsdb.com/api/v1/json/3";

// ID të ligave kryesore (TheSportsDB)
const LEAGUES = [
  // Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Primeira Liga, Süper Lig
  "4328", "4335", "4332", "4331", "4334", "4337", "4344", "4387"
];

// Helper fetch me timeout + cache
async function fetchJSON(url, ttlSeconds = 60) {
  const cached = cache.get(url);
  if (cached) return cached;

  try {
    const res = await axios.get(url, { timeout: 12000 });
    const data = res.data || {};
    cache.set(url, data, ttlSeconds);
    return data;
  } catch (e) {
    // Kthe çfarë kemi në cache nëse ekziston
    const fallback = cache.get(url);
    if (fallback) return fallback;
    return {};
  }
}

// Normalizim i një eventi nga TheSportsDB
function normalizeEvent(ev) {
  return {
    id: ev.idEvent || ev.id || "",
    league: ev.strLeague || "",
    country: ev.strCountry || ev.strLeagueAlternate || "",
    date: ev.dateEvent || ev.dateEventLocal || "",
    time: ev.strTime || ev.strTimeLocal || "",
    timestamp: ev.strTimestamp || null,
    homeTeam: ev.strHomeTeam || "",
    awayTeam: ev.strAwayTeam || "",
    status: ev.strStatus || "", // TheSportsDB shpesh e lë bosh; për live përdorim livescore endpoint
    homeScore: ev.intHomeScore ?? null,
    awayScore: ev.intAwayScore ?? null
  };
}

// === ENDPOINT: LIVE ===
// Përpiqemi: /livescore.php?l=Soccer
app.get("/api/live", async (req, res) => {
  try {
    const url = `${TSD_BASE}/livescore.php?l=Soccer`;
    const data = await fetchJSON(url, 20);

    // TheSportsDB kthen { events: [...] } ose {events:null}
    const events = Array.isArray(data?.events) ? data.events : [];
    const normalized = events.map(ev => {
      const n = normalizeEvent(ev);
      // Vendos status "LIVE" nëse nuk jepet
      if (!n.status) n.status = "LIVE";
      return n;
    });

    res.json({ matches: normalized });
  } catch {
    res.json({ matches: [] });
  }
});

// === ENDPOINT: SË SHPEJTI ===
// Kombinojmë ndeshjet e rradhës për disa liga me eventsnextleague.php
app.get("/api/upcoming", async (req, res) => {
  try {
    const perLeague = await Promise.all(
      LEAGUES.map(id =>
        fetchJSON(`${TSD_BASE}/eventsnextleague.php?id=${id}`, 300)
      )
    );

    const all = [];
    perLeague.forEach(resp => {
      const arr = Array.isArray(resp?.events) ? resp.events : [];
      arr.forEach(ev => all.push(normalizeEvent(ev)));
    });

    // Rendit sipas date/time
    all.sort((a, b) => {
      const da = `${a.date} ${a.time}`;
      const db = `${b.date} ${b.time}`;
      return da.localeCompare(db);
    });

    res.json({ matches: all });
  } catch {
    res.json({ matches: [] });
  }
});

// === ENDPOINT: TË PËRFUNDUARA ===
// eventsround.php / eventspastleague.php? — përdorim eventspastleague për secilën ligë
app.get("/api/finished", async (req, res) => {
  try {
    const perLeague = await Promise.all(
      LEAGUES.map(id =>
        fetchJSON(`${TSD_BASE}/eventspastleague.php?id=${id}`, 600)
      )
    );

    const all = [];
    perLeague.forEach(resp => {
      const arr = Array.isArray(resp?.events) ? resp.events : [];
      arr.forEach(ev => all.push(normalizeEvent(ev)));
    });

    // Filtro vetëm ato që kanë rezultat
    const withScore = all.filter(m => m.homeScore !== null && m.awayScore !== null);

    // Rendit nga më e fundit
    withScore.sort((a, b) => {
      const da = `${a.date} ${a.time}`;
      const db = `${b.date} ${b.time}`;
      return db.localeCompare(da);
    });

    res.json({ matches: withScore });
  } catch {
    res.json({ matches: [] });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    provider: "TheSportsDB (free)",
    cacheKeys: cache.keys().length
  });
});

// Rrënja: shërbe index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () =>
  console.log(`✅ Shqip365 po punon në portin ${PORT}`)
);
