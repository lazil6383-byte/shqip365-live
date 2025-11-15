const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Lejojmë akses publik për frontend
app.use(express.static("public"));

app.get("/api/live", async (req, res) => {
  try {
    const url =
      "https://www.sportybet.com/api/ng/fsports/events/live?sportId=1";

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(400).json({
        error: "SportyBet blocked the request",
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("SCRAPER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`API Running on port ${PORT}`);
});
