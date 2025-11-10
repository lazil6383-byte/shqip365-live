import express from "express";
import fetch from "node-fetch";

const app = express();
const API_KEY = "7340eeb21f7242de84d5b3bfdf6ac453";

app.get("/", async (req, res) => {
  try {
    const response = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": API_KEY },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test running on port ${PORT}`));
