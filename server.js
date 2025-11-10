import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));

const API_BASE = "https://api.football-data.org/v4";
const API_KEY  = "7340eeb21f7242de84d5b3bfdf6ac453"; // nga emaili yt
const TIER = "TIER_ONE"; // ligat kryesore (mund ta heqim më vonë)

function dstr(date) { return date.toISOString().slice(0,10); }
function todayRange(daysFrom=0, daysTo=0) {
  const now = new Date();
  const from = new Date(now); from.setDate(from.getDate()+daysFrom);
  const to   = new Date(now); to.setDate(to.getDate()+daysTo);
  return { dateFrom: dstr(from), dateTo: dstr(to) };
}

async function fdFetch(url) {
  const r = await fetch(url, { headers: { "X-Auth-Token": API_KEY }});
  if (!r.ok) {
    const t = await r.text().catch(()=> "");
    throw new Error(`FD ${r.status} ${r.statusText}: ${t}`);
  }
  return r.json();
}

function shapeMatches(fd) {
  // fd.matches (v4) -> listë
  const list = Array.isArray(fd.matches) ? fd.matches : [];
  return list.map(m => ({
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    competition: m.competition?.name || "",
    home: m.homeTeam?.name || "",
    away: m.awayTeam?.name || "",
    score: {
      fullTime: m.score?.fullTime || { home: null, away: null }
    }
  }));
}

app.get("/health", (req,res)=> res.json({ok:true,total:0,updated:new Date().toISOString()}));

// LIVE (IN_PLAY, PAUSED) sot
app.get("/api/live", async (req,res) => {
  try {
    const {dateFrom,dateTo} = todayRange(0,0);
    const url = new URL(`${API_BASE}/matches`);
    url.searchParams.set("dateFrom", dateFrom);
    url.searchParams.set("dateTo", dateTo);
    url.searchParams.set("status", "IN_PLAY,PAUSED");
    url.searchParams.set("permission", TIER);

    const data = await fdFetch(url.toString());
    res.json({ filters:{dateFrom,dateTo,permission:TIER,status:["IN_PLAY","PAUSED"]},
      resultSet:{ count: data.count || 0, matches: shapeMatches(data) }});
  } catch (e) {
    res.status(500).json({error:true,message:e.message});
  }
});

// SË SHPEJTI (SCHEDULED) 0-3 ditë
app.get("/api/soon", async (req,res) => {
  try {
    const {dateFrom,dateTo} = todayRange(0,3);
    const url = new URL(`${API_BASE}/matches`);
    url.searchParams.set("dateFrom", dateFrom);
    url.searchParams.set("dateTo", dateTo);
    url.searchParams.set("status", "SCHEDULED");
    url.searchParams.set("permission", TIER);

    const data = await fdFetch(url.toString());
    res.json({ filters:{dateFrom,dateTo,permission:TIER,status:["SCHEDULED"]},
      resultSet:{ count: data.count || 0, matches: shapeMatches(data) }});
  } catch (e) {
    res.status(500).json({error:true,message:e.message});
  }
});

// PËRFUNDUAR (FINISHED) dje-sot
app.get("/api/finished", async (req,res) => {
  try {
    const {dateFrom,dateTo} = todayRange(-1,0);
    const url = new URL(`${API_BASE}/matches`);
    url.searchParams.set("dateFrom", dateFrom);
    url.searchParams.set("dateTo", dateTo);
    url.searchParams.set("status", "FINISHED");
    url.searchParams.set("permission", TIER);

    const data = await fdFetch(url.toString());
    res.json({ filters:{dateFrom,dateTo,permission:TIER,status:["FINISHED"]},
      resultSet:{ count: data.count || 0, matches: shapeMatches(data) }});
  } catch (e) {
    res.status(500).json({error:true,message:e.message});
  }
});

// SPA
app.get("*", (req,res)=>{
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Shqip365 live on ${PORT}`));
