import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Live ⚡");
});

app.get("/live", async (req, res) => {
  const url = "https://www.sportybet.com/api/ng/betting/fixtures/live";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.sportybet.com/",
        Origin: "https://www.sportybet.com",
        Connection: "keep-alive"
      }
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return res.json(json);
    } catch (err) {
      return res.json({
        error: "SportyBet blocked JSON",
        details: "",
        raw: text
      });
    }
  } catch (error) {
    res.json({
      error: "Server error",
      details: error.message
    });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log("API Running on port", port));
