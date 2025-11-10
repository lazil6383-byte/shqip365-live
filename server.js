import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import cron from 'node-cron';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

/* ─────────────────────────────
   CACHE në RAM (pa DB për thjeshtësi)
───────────────────────────── */
const store = {
  byId: new Map(),
  lastRange: null,
  lastLive: null
};

function normStatus(m) {
  // në mungesë të statusit nga burimi, e llogarisim me orar
  const now = Date.now();
  const t = new Date(m.utcDate).getTime();
  if (m.score?.fullTime?.home != null && m.score?.fullTime?.away != null) return 'FINISHED';
  if (t <= now && now <= t + 120 * 60 * 1000) return 'IN_PLAY'; // brenda 120'
  if (t > now) return 'SCHEDULED';
  return 'FINISHED';
}

function upsert(list) {
  let n = 0;
  for (const m of list) {
    if (!m?.providerId) continue;
    // Normalizo status
    m.status = normStatus(m);
    store.byId.set(m.providerId, m);
    n++;
  }
  return n;
}

function pick(kind, days = 5) {
  const all = [...store.byId.values()];
  const now = Date.now();
  const end = now + days * 86400000;

  const arr = all.filter(m => {
    const t = new Date(m.utcDate).getTime();
    if (kind === 'live') return m.status === 'IN_PLAY';
    if (kind === 'upcoming') return m.status === 'SCHEDULED' && t <= end;
    if (kind === 'finished') return m.status === 'FINISHED' && t >= now - 7 * 86400000;
    return true;
  }).sort((a,b) => new Date(a.utcDate) - new Date(b.utcDate));

  return arr;
}

/* ─────────────────────────────
   PROVIDER 1: Scorebat (pa key)
   https://www.scorebat.com/video-api/v3/
───────────────────────────── */
async function fetchScorebat() {
  const url = 'https://www.scorebat.com/video-api/v3/';
  const res = await fetch(url);
  const data = await res.json();

  const items = (data?.response || []).map((it, idx) => {
    const comp = it.competition || {};
    const home = it.teams?.[0] || {};
    const away = it.teams?.[1] || {};

    return {
      provider: 'scorebat',
      providerId: `sb_${it.title || idx}`,
      utcDate: new Date(it.date),
      league: {
        id: comp.id ? String(comp.id) : '',
        name: comp.name || '',
        country: comp.country || ''
      },
      homeTeam: {
        id: home.id ? String(home.id) : '',
        name: home.name || (it.title?.split(' - ')[0] ?? 'Home'),
        logo: home.logo || ''
      },
      awayTeam: {
        id: away.id ? String(away.id) : '',
        name: away.name || (it.title?.split(' - ')[1] ?? 'Away'),
        logo: away.logo || ''
      },
      score: {
        fullTime: { home: null, away: null },
        halfTime: { home: null, away: null }
      }
    };
  });

  return items;
}

/* ─────────────────────────────
   PROVIDER 2: OpenFootball (fallback, pa key)
   p.sh. Premier League 2024-25 fixtures
───────────────────────────── */
const OPENFOOTBALL_SOURCES = [
  // Premier League 24-25
  'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.1.json',
  // La Liga 24-25
  'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/es.1.json',
  // Serie A 24-25
  'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/it.1.json',
  // Bundesliga 24-25
  'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/de.1.json'
];

async function fetchOpenFootball() {
  const out = [];
  for (const url of OPENFOOTBALL_SOURCES) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      const name = data?.name || '';
      const rounds = data?.rounds || [];
      for (const r of rounds) {
        for (const m of (r.matches || [])) {
          // datat janë lokale, i trajtojmë si UTC në 18:00 nëse s’ka orë
          const dateStr = m.date || (r?.name || '').split(' ')[1] || '';
          const dt = m.date ? new Date(m.date) : new Date(`${dateStr}T18:00:00Z`);

          out.push({
            provider: 'openfootball',
            providerId: `of_${name}_${m.team1?.name}_${m.team2?.name}_${m.date || Math.random()}`,
            utcDate: dt,
            league: { id: '', name, country: '' },
            homeTeam: { id: '', name: m.team1?.name || 'Home', logo: '' },
            awayTeam: { id: '', name: m.team2?.name || 'Away', logo: '' },
            score: {
              fullTime: { home: null, away: null },
              halfTime: { home: null, away: null }
            }
          });
        }
      }
    } catch {}
  }
  return out;
}

/* ─────────────────────────────
   RIFRESKIMI
───────────────────────────── */
async function refreshRange() {
  const a = await fetchScorebat();      // pa key – sot & rreth sotit
  const b = await fetchOpenFootball();  // fixtures ligash kryesore
  const all = [...a, ...b];
  const n = upsert(all);
  store.lastRange = { count: n, at: new Date() };
}

async function refreshLive() {
  // Scorebat nuk jep status LIVE zyrtar;
  // “simulojmë” LIVE me orarin (shih normStatus).
  // E njëjta bëhet edhe për OF fixtures.
  const n = upsert([]); // thjesht re-normalizon ekzistueset kur thirret refreshRange
  store.lastLive = { count: n, at: new Date() };
}

// bootstrap + cron
await refreshRange();
await refreshLive();
cron.schedule('*/2 * * * *', refreshLive);      // “live” çdo 2 min
cron.schedule('*/30 * * * *', refreshRange);    // range çdo 30 min

/* ─────────────────────────────
   ENDPOINTS
───────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    provider: ['scorebat','openfootball'],
    lastRange: store.lastRange,
    lastLive: store.lastLive,
    cached: store.byId.size
  });
});

app.get('/api/upcoming', (req, res) => {
  const days = Number(req.query.days || 5);
  res.json({ matches: pick('upcoming', days) });
});

app.get('/api/live', (req, res) => {
  res.json({ matches: pick('live') });
});

app.get('/api/finished', (req, res) => {
  const days = Number(req.query.days || 2);
  res.json({ matches: pick('finished', days) });
});

app.get('/api/by-date', (req, res) => {
  const date = req.query.date; // YYYY-MM-DD
  if (!date) return res.status(400).json({ error: 'Mungon ?date=YYYY-MM-DD' });
  const arr = [...store.byId.values()]
    .filter(m => (new Date(m.utcDate).toISOString().slice(0,10) === date))
    .sort((a,b) => new Date(a.utcDate) - new Date(b.utcDate));
  res.json({ matches: arr });
});

app.listen(PORT, () => console.log(`✅ Shqip365 (free) running on :${PORT}`));
