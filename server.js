import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// ROUTE ROOT
app.get("/", (req, res) => {
  res.send("API Live ⚡");
});

// ROUTE TEST
app.get("/live", (req, res) => {
  res.json({ status: "Live", time: new Date() });
});

// ROUTE LIVE MATCHES
app.get("/api/live-matches", async (req, res) => {
  try {
    const response = await fetch(
      "https://www.sportybet.com/api/ng/betting/fixtures/live",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      }
    );

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      res.json(json);
    } catch (err) {
      res.json({
        error: "SportyBet blocked JSON",
        details: text.slice(0, 200),
      });
    }
  } catch (error) {
    res.json({
      error: "Server error",
      details: error.message,
    });
  }
});

// PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`API Running on port ${PORT}`);
});
