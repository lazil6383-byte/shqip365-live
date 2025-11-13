const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// static folder
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// SCRAPER
async function scrapeLiveScore(pageType = "live") {
    let url = "https://www.livescore.com/en/football/";

    if (pageType === "upcoming") url += "fixtures/";
    if (pageType === "finished") url += "results/";

    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept-Language": "en-US,en;q=0.9"
        }
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const matches = [];

    $("[data-testid='match-row']").each((_, el) => {
        const row = $(el);

        const league = row.closest("[data-testid='match-group']")
            .find("header")
            .text()
            .trim() || "Football";

        const home = row.find("[data-testid='team-home']").text().trim();
        const away = row.find("[data-testid='team-away']").text().trim();
        const scoreOrTime =
            row.find("[data-testid='score']").text().trim() ||
            row.find("[data-testid='time']").text().trim();

        matches.push({ league, home, away, scoreOrTime });
    });

    return matches;
}

// ROUTES
app.get("/api/test", (req, res) => {
    res.json({ ok: true });
});

app.get("/api/live", async (req, res) => {
    try {
        res.json(await scrapeLiveScore("live"));
    } catch (err) {
        res.status(500).json({ error: "Scraper error" });
    }
});

// fallback
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// start
app.listen(PORT, () => console.log("Server running on port " + PORT));
