import express from "express";
import fetch from "node-fetch";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = "49e8b9175faa444ebe06923fc9b2a81b";

app.use(express.static("public"));

app.get("/api/matches", async (req, res) => {
  const status = req.query.status || "LIVE";
  try {
    const response = await fetch(`https://api.football-data.org/v4/matches?status=${status}`, {
      headers: { "X-Auth-Token": API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gabim në kërkesë:", error);
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
