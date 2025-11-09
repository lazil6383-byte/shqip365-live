const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// ✅ Vendos këtu API Key-n tënde nga API-FOOTBALL
const API_KEY = 8a0ecad2149f5ccf5da3c61dbaacf6b9;

// Merr ndeshjet live
app.get("/api/live", async (req, res) => {
  try {
    const response = await axios.get("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve live" });
  }
});

// Merr ndeshjet e ardhshme
app.get("/api/upcoming", async (req, res) => {
  try {
    const response = await axios.get("https://v3.football.api-sports.io/fixtures?next=50", {
      headers: { "x-apisports-key": API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve të ardhshme" });
  }
});

app.listen(PORT, () => {
  console.log(`Serveri po punon në portën ${PORT}`);
});
