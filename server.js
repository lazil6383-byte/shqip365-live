const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// API nga SportyBet (Kenya)
const SPORTY_URL = "https://www.sportybet.com/api/ng/factsCenter/football/events?stage=Inplay";

app.get("/api/live", async (req, res) => {
    try {
        const response = await axios.get(SPORTY_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json"
            }
        });

        return res.json(response.data);
    } catch (err) {
        console.error("ERROR FETCHING SPORTYBET:", err);
        return res.json({ error: "SportyBet blocked the request" });
    }
});

app.get("/", (req, res) => {
    res.send("Shqip365 LIVE API is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port " + PORT));
