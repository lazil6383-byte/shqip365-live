// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const rand = (min, max) => Math.random() * (max - min) + min;
const irand = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[irand(0, arr.length - 1)];

const LEAGUES = [
  "England • Premier League","Spain • La Liga","Italy • Serie A","Germany • Bundesliga",
  "France • Ligue 1","Netherlands • Eredivisie","Portugal • Primeira Liga",
  "Turkey • Süper Lig","Belgium • Pro League","Scotland • Premiership"
];

const TEAMS_BY_COUNTRY = {
  England:["Man City","Liverpool","Arsenal","Chelsea","Spurs","Man United","Newcastle","Aston Villa","Brighton","West Ham"],
  Spain:["Real Madrid","Barcelona","Atletico Madrid","Sevilla","Valencia","Real Betis","Villarreal","Real Sociedad","Athletic","Osasuna"],
  Italy:["Inter","Milan","Juventus","Napoli","Roma","Lazio","Atalanta","Fiorentina","Bologna","Udinese"],
  Germany:["Bayern","Dortmund","Leipzig","Leverkusen","Stuttgart","Freiburg","Wolfsburg","Gladbach","Frankfurt","Union Berlin"],
  France:["PSG","Lyon","Marseille","Monaco","Lille","Rennes","Nice","Nantes","Lens","Toulouse"],
  Netherlands:["Ajax","PSV","Feyenoord","AZ","Twente","Utrecht","Vitesse","Heerenveen","Groningen","Sparta"],
  Portugal:["Porto","Benfica","Sporting","Braga","Guimaraes","Boavista","Rio Ave","Famalicao","Casa Pia","Estoril"],
  Turkey:["Galatasaray","Fenerbahçe","Besiktas","Trabzonspor","Basaksehir","Adana Demir","Antalyaspor","Sivasspor","Konyaspor","Kayserispor"],
  Belgium:["Club Brugge","Genk","Gent","Anderlecht","Antwerp","Standard Liege","Charleroi","Cercle Brugge","St. Truiden","KV Mechelen"],
  Scotland:["Celtic","Rangers","Hearts","Hibernian","Aberdeen","Kilmarnock","Motherwell","St. Mirren","Dundee","St. Johnstone"]
};

const PLAYERS = (team) =>
  Array.from({ length: 18 }).map((_, i) => ({
    id: `${team}-${i+1}`, name: `${team} Player ${i+1}`, shirt: i+1
  }));

// ---- gjenero 120 ndeshje (100+ aktive/upcoming)
let MATCHES = [];
let NEXT_ID = 1;

function generateMatches(n = 120) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const lg = pick(LEAGUES);
    const country = lg.split(" • ")[0];
    const teams = TEAMS_BY_COUNTRY[country] || TEAMS_BY_COUNTRY.England;
    let home = pick(teams), away = pick(teams);
    while (away === home) away = pick(teams);

    const startOffsetMin = irand(-40, 240); // disa live, disa fillojnë më vonë
    const duration = 105; // me shtesa
    const kickOff = Date.now() + startOffsetMin * 60 * 1000;

    const m = {
      id: String(NEXT_ID++),
      league: lg,
      country,
      home, away,
      minute: Math.max(0, Math.min(90, startOffsetMin < 0 ? Math.min(90, -startOffsetMin) : 0)),
      kickOff,
      duration,
      status: startOffsetMin < 0 ? "LIVE" : "UPCOMING",
      score: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      cards: [],
      events: [],
      players: { home: PLAYERS(home), away: PLAYERS(away) },
      odds: seedOdds()
    };
    arr.push(m);
  }
  return arr;
}

function seedOdds() {
  // 1X2, Over/Under 2.5, Asian 0, NextGoal
  const fav = Math.random() < 0.5 ? "H" : "A";
  const base = fav === "H" ? [1.75, 3.6, 4.5] : [4.2, 3.6, 1.8];
  return {
    "1X2": { "1": base[0], X: base[1], "2": base[2] },
    "O/U 2.5": { Over: +(rand(1.6, 2.6)).toFixed(2), Under: +(rand(1.6, 2.6)).toFixed(2) },
    "AH 0": { Home: +(rand(1.7, 2.2)).toFixed(2), Away: +(rand(1.7, 2.2)).toFixed(2) },
    "Next Goal": { Home: +(rand(1.9, 3.5)).toFixed(2), None: +(rand(2.0, 5.0)).toFixed(2), Away: +(rand(1.9, 3.5)).toFixed(2) }
  };
}

MATCHES = generateMatches(120);

// ---- motor "live" që ndryshon çdo 3 sekonda
const clients = new Set();
function broadcast(type, payload) {
  const data = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(res => res.write(data));
}

// probabilitete të thjeshta për minuta
function tickMatch(m) {
  const now = Date.now();
  if (m.status === "UPCOMING") {
    if (now >= m.kickOff) { m.status = "LIVE"; m.minute = 0; }
    return;
  }
  if (m.status !== "LIVE") return;

  m.minute = Math.min(90, m.minute + irand(1, 2));

  // gjenero evente: gol, karton, këndorë
  const pGoal = m.minute < 15 ? 0.02 : m.minute < 75 ? 0.035 : 0.05; // rritet në fund
  const pCard = 0.02;
  const pCorner = 0.07;

  // corners
  if (Math.random() < pCorner) {
    const side = Math.random() < 0.5 ? "home" : "away";
    m.corners[side]++;
    m.events.push({ t: "corner", minute: m.minute, side });
  }

  // cards
  if (Math.random() < pCard) {
    const side = Math.random() < 0.5 ? "home" : "away";
    const player = pick(m.players[side]);
    const kind = Math.random() < 0.9 ? "yellow" : "red";
    m.cards.push({ side, player: player.name, kind, minute: m.minute });
    m.events.push({ t: "card", minute: m.minute, side, player: player.name, kind });
  }

  // goals
  if (Math.random() < pGoal) {
    const side = Math.random() < 0.55 ? "home" : "away";
    const player = pick(m.players[side]);
    m.score[side]++;

    // ndrysho koeficientët kur shënohet gol
    const shift = side === "home" ? -0.25 : 0.25;
    m.odds["1X2"]["1"] = +(Math.max(1.01, m.odds["1X2"]["1"] + shift)).toFixed(2);
    m.odds["1X2"]["2"] = +(Math.max(1.01, m.odds["1X2"]["2"] - shift)).toFixed(2);
    m.odds["O/U 2.5"].Over = +(Math.max(1.01, m.odds["O/U 2.5"].Over - 0.15)).toFixed(2);
    m.odds["O/U 2.5"].Under = +(Math.max(1.01, m.odds["O/U 2.5"].Under + 0.15)).toFixed(2);

    m.events.push({ t: "goal", minute: m.minute, side, player: player.name });
    broadcast("goal", { id: m.id, minute: m.minute, score: m.score, player: player.name, side });
  }

  // dridh pak koeficientët në çdo tick (si treg)
  const jiggle = (x) => +(Math.max(1.01, x * rand(0.985, 1.015))).toFixed(2);
  const o = m.odds;
  o["1X2"]["1"] = jiggle(o["1X2"]["1"]);
  o["1X2"]["2"] = jiggle(o["1X2"]["2"]);
  o["1X2"]["X"] = jiggle(o["1X2"]["X"]);
  o["AH 0"].Home = jiggle(o["AH 0"].Home);
  o["AH 0"].Away = jiggle(o["AH 0"].Away);
  o["Next Goal"].Home = jiggle(o["Next Goal"].Home);
  o["Next Goal"].Away = jiggle(o["Next Goal"].Away);
  o["Next Goal"].None = jiggle(o["Next Goal"].None);

  if (m.minute >= 90) {
    m.status = "FT";
    broadcast("fulltime", { id: m.id });
  }
}

setInterval(() => {
  MATCHES.forEach(m => {
    const before = { minute: m.minute, score: { ...m.score } };
    tickMatch(m);
    if (m.status === "LIVE") {
      broadcast("tick", { id: m.id, minute: m.minute, odds: m.odds, score: m.score, corners: m.corners });
      // nëse ka ndryshim rezultati, broadcast u bë te “goal”
    }
  });
}, 3000);

// ---- API
app.get("/api/leagues", (req, res) => {
  const counts = {};
  for (const m of MATCHES) counts[m.league] = (counts[m.league] || 0) + 1;
  res.json(Object.keys(counts).map(name => ({ name, count: counts[name] })));
});

app.get("/api/fixtures", (req, res) => {
  const { status } = req.query; // LIVE | UPCOMING | FT
  let rows = MATCHES;
  if (status) rows = rows.filter(m => m.status === status);
  rows = rows.map(m => ({
    id: m.id, league: m.league, status: m.status, minute: m.minute,
    home: m.home, away: m.away, score: m.score, odds: m.odds, kickOff: m.kickOff
  }));
  res.json(rows);
});

app.get("/api/match/:id", (req, res) => {
  const m = MATCHES.find(x => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: "Not found" });
  res.json(m);
});

// SSE stream për ngjarje live
app.get("/api/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  res.write("event: hello\ndata: {}\n\n");
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

// fallback në SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("API running on :" + PORT));
