import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const API_KEY = "7340eeb21f7242de84d5b3bfdf6ac453";
const BASE_URL = "https://api.football-data.org/v4";

// ✅ Ligat kryesore + disa shtesë (si Bet365)
const COMPETITIONS = [
  "PL", "PD", "SA", "BL1", "FL1", // top 5
  "CL", "EL", "EC",               // UEFA
  "PPL", "DED", "BSA", "ELC",     // shtesë
  "WC-QUAL", "CLI", "MLS"         // kombëtare & jashtë Evropës
];

// 🧠 Merr ndeshjet për një ligë të caktuar (me datë & orar)
async function getMatchesForLeague(competition, status = "SCHEDULED") {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dateFrom = today.toISOString().split("T")[0];
  const dateTo = tomorrow.toISOString().split("T")[0];

  const url = `${BASE_URL}/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=${status}`;

  try {
    const res = await fetch(url, {
      headers: { "X-Auth-Token": API_KEY },
    });

    if (!res.ok) {
      console.error(`Gabim (${res.status}) në ${competition}`);
      return [];
    }

    const data = await res.json();
    if (!data.matches) return [];

    // Formatim për frontend-in
    return data.matches.map(match => ({
      id: match.id,
      league: data.competition?.name || "N/A",
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      status: match.status,
      utcDate: match.utcDate,
      time: new Date(match.utcDate).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" }),
      date: new Date(match.utcDate).toLocaleDateString("sq-AL", { day: "2-digit", month: "short" }),
      score: match.score?.fullTime || {}
    }));
  } catch (err) {
    console.error("Gabim gjatë marrjes së ndeshjeve:", err);
    return [];
  }
}

// ✅ Merr të gjitha ndeshjet nga të gjitha ligat
async function getAllMatches(status = "SCHEDULED") {
  let allMatches = [];
  for (const comp of COMPETITIONS) {
    const matches = await getMatchesForLeague(comp, status);
    allMatches = allMatches.concat(matches);
  }

  // Rendit sipas orarit
  return allMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
}

// ✅ Endpoint kryesor LIVE + SCHEDULED
app.get("/live", async (req, res) => {
  const live = await getAllMatches("IN_PLAY");
  if (live.length > 0) return res.json({ matches: live });

  const scheduled = await getAllMatches("SCHEDULED");
  res.json({ matches: scheduled });
});

// ✅ Ndeshjet së shpejti
app.get("/upcoming", async (req, res) => {
  const upcoming = await getAllMatches("SCHEDULED");
  res.json({ matches: upcoming });
});

// ✅ Ndeshjet e përfunduara
app.get("/finished", async (req, res) => {
  const finished = await getAllMatches("FINISHED");
  res.json({ matches: finished });
});

// ✅ Faqja kryesore
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Shqip365 Pro Live në portën ${PORT}`)
);
