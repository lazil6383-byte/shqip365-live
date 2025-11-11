import express from "express";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import NodeCache from "node-cache";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "public")));

// 🔑 API keys – lexohen nga ENV nëse i vendos te Render.
// Si default, përdor çelësat që më dhe ti.
const SPORTMONKS_KEY = process.env.SPORTMONKS_KEY || "Em3Z4L6F8SDvbTmpHxkba04V9sEitJXz6OJpqzUZqs5PXCvIVxBKHF3xLXuj";
const FOOTBALLDATA_KEY = process.env.FOOTBALLDATA_KEY || "ce4ba1190d3445d0b7cc0ac80f092ef6";

const PORT = process.env.PORT || 10000;
const cache = new NodeCache({ stdTTL: 45, checkperiod: 30 });

// Helpers për data
const iso = d => d.toISOString().slice(0,10);
const addDays = (d,n)=>{ const x=new Date(d); x.setDate(x.getDate()+n); return x; };

// Wrap për SportMonks (me cache)
async function smGet(url, params = {}) {
  const key = "sm:" + url + JSON.stringify(params);
  const cached = cache.get(key);
  if (cached) return cached;
  const full = "https://api.sportmonks.com/v3/football/" + url;
  const res = await axios.get(full, { params: { api_token: SPORTMONKS_KEY, ...params } });
  cache.set(key, res.data);
  return res.data;
}

// Wrap për Football-Data (me cache)
async function fdGet(path, params = {}) {
  const key = "fd:" + path + JSON.stringify(params);
  const cached = cache.get(key);
  if (cached) return cached;
  const full = "https://api.football-data.org/v4" + path;
  const res = await axios.get(full, { headers: { "X-Auth-Token": FOOTBALLDATA_KEY }, params });
  cache.set(key, res.data);
  return res.data;
}

// === LIVE (gjithë bota)
app.get("/api/live", async (req, res) => {
  try {
    const sm = await smGet("livescores", {
      include: "participants;league;season;stage;round;venue"
    });
    const fd = await fdGet("/matches", { status: "LIVE" });
    res.json({ sportmonks: sm, footballdata: fd });
  } catch (e) {
    console.error("LIVE error:", e?.response?.status, e?.message);
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve live." });
  }
});

// === SË SHPEJTI (5 ditët në vijim)
app.get("/api/upcoming", async (req, res) => {
  try {
    const today = new Date();
    const from = iso(today);
    const to = iso(addDays(today, 5));
    const sm = await smGet(`fixtures/between/${from}/${to}`, {
      include: "participants;league;season;stage;round;venue"
    });
    const fd = await fdGet("/matches", { dateFrom: from, dateTo: to, status: "SCHEDULED" });
    res.json({ sportmonks: sm, footballdata: fd });
  } catch (e) {
    console.error("UPCOMING error:", e?.response?.status, e?.message);
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve 'Së Shpejti'." });
  }
});

// === PËRFUNDUAR (2 ditë mbrapa)
app.get("/api/finished", async (req, res) => {
  try {
    const today = new Date();
    const from = iso(addDays(today, -2));
    const to = iso(today);
    const sm = await smGet(`fixtures/between/${from}/${to}`, {
      include: "participants;league;season;stage;round;venue"
    });
    const fd = await fdGet("/matches", { dateFrom: from, dateTo: to, status: "FINISHED" });
    res.json({ sportmonks: sm, footballdata: fd });
  } catch (e) {
    console.error("FINISHED error:", e?.response?.status, e?.message);
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve të përfunduara." });
  }
});

// Faqja
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Shqip365 • Live API running on port ${PORT}`));
