import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/live", async (req, res) => {
  try {
    const response = await fetch("https://www.sportybet.com/api/ng/betting/fixtures/live", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.sportybet.com/ng/",
        "Origin": "https://www.sportybet.com"
      }
    });

    const text = await response.text();

    // nëse s’kthehet JSON → nuk e lexojmë si JSON direkt
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch (e) {
      return res.json({
        error: "SportyBet blocked JSON",
        details: text.slice(0, 200)
      });
    }

  } catch (err) {
    return res.json({
      error: "Server crash",
      details: err.toString()
    });
  }
});

app.listen(10000, () => {
  console.log("API Running on port 10000");
});
