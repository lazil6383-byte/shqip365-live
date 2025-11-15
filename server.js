import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/live", async (req, res) => {
  try {
    const sportyUrl = "https://www.sportybet.com/api/ng/betting/fixtures/live";

    const response = await fetch(sportyUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        Referer: "https://www.sportybet.com/ng/",
        Origin: "https://www.sportybet.com",
        Connection: "keep-alive",
      },
    });

    if (!response.ok) {
      return res.status(500).json({
        error: "SportyBet blocked the request",
        status: response.status,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API Running on port ${PORT}`));
