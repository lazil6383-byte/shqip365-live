import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// HEADERS që duken si telefon i vërtetë
const mobileHeaders = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.sportybet.com/",
  "Origin": "https://www.sportybet.com",
  "Connection": "keep-alive",
};

app.get("/api/live", async (req, res) => {
  try {
    const url =
      "https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sbVersion=400&marketGroupId=1&category=1&leagueId=0";

    const response = await fetch(url, {
      method: "GET",
      headers: mobileHeaders,
    });

    if (!response.ok) {
      return res.status(400).json({
        error: "SportyBet blocked the request",
      });
    }

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error("SCRAPER ERROR:", err);
    res.status(500).json({ error: "Scraper crashed" });
  }
});

app.get("/", (req, res) => {
  res.send("API LIVE ✔️ shqip365 scraper running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Running on port ${PORT}`));
