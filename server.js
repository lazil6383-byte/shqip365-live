import express from "express";
import axios from "axios";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import NodeCache from "node-cache";

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("tiny"));
app.use(express.static("public"));

// Porti për Render
const PORT = process.env.PORT || 10000;

// Dy API KEY që më dhe
const API_KEYS = [
  "c639ca3a6c0a4e2cd8ee3862daabf67f",
  "ce4ba1190d3445d0b7cc0ac80f092ef6"
];

const BASE_URL = "https://api.football-data.org/v4";
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });
let keyIndex = 0;
let backoffUntil = 0;

// Funksion ndihmës për rotacionin e çelësave
function nextKey() {
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return API_KEYS[keyIndex];
}

// Bllokon thirrjet gjatë backoff
function inBackoff() {
  return Date.now() < backoffUntil;
}

// Fetch me cache + fallback API key
async function fetchData(path, ttl = 60) {
  const cacheKey = path;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (inBackoff()) return cache.get(cacheKey) || [];

  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[keyIndex];
    try {
      const res = await axios.get(`${BASE_URL}${path}`, {
        headers: { "X-Auth-Token": key },
        timeout: 10000
      });
      cache.set(cacheKey, res.data, ttl);
      return res.data;
    } catch (e) {
      const code = e?.response?.status;
      if (code === 429 || (code >= 500 && code < 600)) {
        backoffUntil = Date.now() + 30000;
        nextKey();
        continue;
      }
      if (code === 401 || code === 403) {
        nextKey();
        continue;
      }
      throw e;
    }
  }

  return cache.get(cacheKey) || [];
}

// Endpoint për ndeshje live
app.get("/api/live", async (req, res) => {
  try {
    const data = await fetchData("/matches?status=LIVE", 20);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve live." });
  }
});

// Ndeshje të ardhshme
app.get("/api/upcoming", async (req, res) => {
  try {
    const data = await fetchData("/matches?status=SCHEDULED", 120);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve së ardhshme." });
  }
});

// Ndeshje të përfunduara
app.get("/api/finished", async (req, res) => {
  try {
    const data = await fetchData("/matches?status=FINISHED", 300);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve të përfunduara." });
  }
});

// Shëndeti i serverit
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    keyInUse: keyIndex + 1,
    backoff: backoffUntil > Date.now(),
    keysTotal: API_KEYS.length
  });
});

app.listen(PORT, () =>
  console.log(`✅ Shqip365 Live (Professional) po funksionon në portin ${PORT}`)
);
