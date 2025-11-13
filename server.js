import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Fix për __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lejo statiket (index.html, style.css, script.js) nga /public
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// ----------------------
//  FUNKSION SCRAPER
// ----------------------
async function scrapeLiveScore(pageType = "live") {
  let url;

  if (pageType === "live") {
    url = "https://www.livescore.com/en/football/live/";
  } else if (pageType === "upcoming") {
    url = "https://www.livescore.com/en/football/fixtures/";
  } else if (pageType === "finished") {
    url = "https://www.livescore.com/en/football/results/";
  } else {
    return [];
  }

  const res = await fetch(url, {
    headers: {
      // pa User-Agent serioz, shumë faqe kthejnë faqe bosh
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const matches = [];

  // ⚠️ KËTA SELECTOR mund të ndryshojnë nga LiveScore.
  // Ideja: gjej çdo kartë ndeshjeje dhe nxirr:
  // – ligën
  // – skuadrat
  // – orën / rezultatin
  // Këtu është një SHEMBULL ku munda t’i quaj "match cards".
  $(".match-row, [data-testid='match-row']").each((_, el) => {
    const row = $(el);

    // Liga (nganjëherë vjen në një element prind më sipër)
    const league =
      row.closest("[data-testid='match-group']").find("header").text().trim() ||
      row.closest("section").find("header").first().text().trim() ||
      "Football";

    // Skuadrat
    const home =
      row
        .find(".match-row__participant--home, .match-row__team--home, [data-testid='team-home']")
        .text()
        .trim() || "";
    const away =
      row
        .find(".match-row__participant--away, .match-row__team--away, [data-testid='team-away']")
        .text()
        .trim() || "";

    // Rezultati ose ora
    const scoreOrTime =
      row.find(".match-row__score, [data-testid='score']").text().trim() ||
      row.find(".match-row__time, time").text().trim() ||
      "";

    // Statusi (LIVE, FT, 1H, etj)
    const status =
      row
        .find(".match-row__status, [data-testid='status']")
        .text()
        .trim()
        .toUpperCase() || "";

    if (!home && !away) return; // nëse s’ka skuadra, mos e fut

    matches.push({
      league,
      home,
      away,
      scoreOrTime,
      status
    });
  });

  return matches;
}

// ----------------------
//  ENDPOINTS API
// ----------------------

// Test
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Shqip365 scraper gati ✅" });
});

// LIVE
app.get("/api/live", async (req, res) => {
  try {
    const matches = await scrapeLiveScore("live");
    res.json(matches);
  } catch (err) {
    console.error("LIVE error:", err);
    res.status(500).json({ error: "Nuk u morën ndeshjet live" });
  }
});

// SË SHPEJTI (Fixtures)
app.get("/api/upcoming", async (req, res) => {
  try {
    const matches = await scrapeLiveScore("upcoming");
    res.json(matches);
  } catch (err) {
    console.error("UPCOMING error:", err);
    res.status(500).json({ error: "Nuk u morën ndeshjet e ardhshme" });
  }
});

// PËRFUNDUAR
app.get("/api/finished", async (req, res) => {
  try {
    const matches = await scrapeLiveScore("finished");
    res.json(matches);
  } catch (err) {
    console.error("FINISHED error:", err);
    res.status(500).json({ error: "Nuk u morën ndeshjet e përfunduara" });
  }
});

// Default → index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log("✅ Shqip365 scraper po punon në portin " + PORT);
});
