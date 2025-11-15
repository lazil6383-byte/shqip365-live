import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Fix dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

const BET365_URL = "https://www.bet365.com/#/IP/";

// =======================
//   SCRAPER FUNKSIONAL
// =======================
async function scrapeBet365() {
  const res = await fetch(BET365_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const matches = [];

  $("div.gl-MarketGroup").each((_, el) => {
    const league = $(el).find("h2").text().trim();
    if (!league.toLowerCase().includes("football")) return;

    $(el)
      .find("div.gl-Market_General")
      .each((_, match) => {
        const home = $(match)
          .find(".sl-CouponParticipantWithBookCloses_NameContainer")
          .first()
          .text()
          .trim();
        const away = $(match)
          .find(".sl-CouponParticipantWithBookCloses_NameContainer")
          .last()
          .text()
          .trim();

        if (!home || !away) return;

        // Koeficientët 1X2
        const odds = {};
        const oddsBtn = $(match).find(".gl-Participant_odds");

        odds.home = parseFloat(oddsBtn.eq(0).text()) || null;
        odds.draw = parseFloat(oddsBtn.eq(1).text()) || null;
        odds.away = parseFloat(oddsBtn.eq(2).text()) || null;

        matches.push({
          league,
          home,
          away,
          date: "Today",
          time: "--",
          live: false,
          odds
        });
      });
  });

  return matches;
}

// =======================
//      API ENDPOINT
// =======================
app.get("/api/matches", async (req, res) => {
  try {
    const data = await scrapeBet365();
    res.json(data);
  } catch (err) {
    console.error("SCRAPER ERROR:", err);
    res.json([]);
  }
});

// =======================
//      FRONTEND
// =======================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () =>
  console.log(`Shqip365 Bet365 scraper running on port ${PORT}`)
);
