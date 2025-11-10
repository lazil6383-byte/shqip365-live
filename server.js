import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const API_KEY = "7340eeb21f7242de84d5b3bfdf6ac453";
const BASE_URL = "https://api.football-data.org/v4";

// ✅ Vetëm ligat që funksionojnë me planin falas
const COMPETITIONS = ["PL", "PD", "SA", "BL1", "FL1"]; // 5 top leagues

async function getMatchesForLeague(competition) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const dateFrom = now.toISOString().split("T")[0];
  const dateTo = tomorrow.toISOString().split("T")[0];
  const url = `${BASE_URL}/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  try {
    const res = await fetch(url, {
      headers: { "X-Auth-Token": API_KEY },
    });

    if (!res.ok) {
      console.error(`Gabim për ${competition}:`, res.status);
      return [];
    }

    const data = await res.json();
    if (!data.matches) return [];

    return data.matches.map((match) => ({
      league: data.competition?.name || "N/A",
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      date: new Date(match.utcDate).toLocaleDateString("sq-AL", {
        day: "2-digit",
        month: "short",
      }),
      time: new Date(match.utcDate).toLocaleTimeString("sq-AL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: match.status,
      score: match.score?.fullTime || {},
    }));
  } catch (err) {
    console.error("Gabim gjatë marrjes së ndeshjeve:", err);
    return [];
  }
}

async function getAllMatches() {
  let allMatches = [];
  for (const comp of COMPETITIONS) {
    const matches = await getMatchesForLeague(comp);
    allMatches = allMatches.concat(matches);
  }

  return allMatches.sort((a, b) => a.time.localeCompare(b.time));
}

app.get("/live", async (req, res) => {
  const matches = await getAllMatches();
  res.json({ matches });
});

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Shqip365 Live në portën ${PORT}`));
