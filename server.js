const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const cheerio = require("cheerio");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// PUBLIC FOLDER
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// SCRAPER FUNCTION
async function scrapeLiveScore(pageType = "live") {
    let url = "https://www.livescore.com/en/football/";

    if (pageType === "upcoming") url += "fixtures/";
    if (pageType === "finished") url += "results/";

    const res = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const matches = [];

    $("[data-testid='match-row']").each((_, el) => {
        const row = $(el);

        const league =
            row.closest("[data-testid='match-group']")
                .find("header")
                .text()
                .trim() || "Football";

        const home = row.find("[data-testid='team-home']").text().trim() || "";
        const away = row.find("[data-testid='team-away']").text().trim() || "";

        const scoreOrTime =
            row.find("[data-testid='score']").text().trim() ||
            row.find("[data-testid='time']").text().trim() ||
            "";

        const status = row.find("[data-testid='status']").text().trim() || "";

        if (!home && !away) return;

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

// ENDPOINTS
app.get("/api/test", (req, res) => {
    res.json({ ok: true, message: "Shqip365 scraper është gati! ✔️" });
});

app.get("/api/live", async (req, res) => {
    try {
        const matches = await scrapeLiveScore("live");
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: "Nuk u morën ndeshjet live" });
    }
});

app.get("/api/upcoming", async (req, res) => {
    try {
        const matches = await scrapeLiveScore("upcoming");
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: "Nuk u morën ndeshjet e ardhshme" });
    }
});

app.get("/api/finished", async (req, res) => {
    try {
        const matches = await scrapeLiveScore("finished");
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: "Nuk u morën ndeshjet e përfunduara" });
    }
});

// DEFAULT ROUTE
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Shqip365 scraper po punon në portin ${PORT}`);
});
