import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Fix __dirname për ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lejo statiket
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// ===========================
// FUNKSIONI I SCRAPERIT
// ===========================
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

  // Marrim HTML me User-Agent serioz
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const matches = [];

  // Selector i rreshtave të ndeshjeve
  $("[data-testid='match-row']").each((_, el) => {
    const row = $(el);

    const league =
      row
        .closest("[data-testid='match-group']")
        .find("header")
        .text()
        .trim() ||
      row.closest("section").find("header").first().text().trim() ||
      "Football";

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

    const scoreOrTime =
      row.find(".match-row__score, [data-testid='score']").text().trim() ||
      row.find(".match-row__time, time").text().trim() ||
      "";

    const status =
      row
        .find(".match-row__status, [data-testid='status']")
        .text()
        .trim()
        .toUpperCase() || "";

    if (!home && !away) return;

    matches.push({
      league,
      home,
      away,
      scoreOrTime,
      status,
    });
  });

  return matches;
}

// ===========================
// ENDPOINTS API
// ===========================

app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Shqip365 scraper është gati! ✔️" });
});

// LIVE
app.get("/api/live", async (req, res) => {
  try {
    const matches = await scrapeLiveScore("live");
    res.json(matches);
  } catch (err) {
    console.error("LIVE ERROR:", err);
    res.status(500).json({ error: "Nuk u morën ndeshjet live" });
  }
});

// UPCOMING
app.get("/api/upcoming", async (req, res) => {
  try {
    const matches = await scrapeLiveScore("upcoming");
    res.json(matches);
  } catch (err) {
    console.error("UPCOMING ERROR:", err);
    res.status(500).json({ error: "Nuk u morën ndeshjet e ardhshme" });
  }
});

// FINISHED
app.get("/api/finished", async (req, res) => {
  try {
    const matches = await scrapeLiveScore("finished");
    res.json(matches);
  } catch (err) {
    console.error("FINISHED ERROR:", err);
    res.status(500).json({ error: "Nuk u morën ndeshjet e përfunduara" });
  }
});

// Default – dërgo index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Startimi i serverit
app.listen(PORT, () => {
  console.log(`✔️ Shqip365 scraper po punon në portin ${PORT}`);
});
