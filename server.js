import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const API_KEY = "8a0ecad2149f5ccf5da3c61dbaacf6b9"; // ← vendose API key këtu

// Endpoint për ndeshjet live
app.get("/matches", async (req, res) => {
  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: {
        "x-apisports-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });

    if (!response.ok) {
      throw new Error(`Error API: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gabim gjatë marrjes së ndeshjeve:", error);
    res.status(500).json({ error: "Nuk mund të marrim ndeshjet për momentin." });
  }
});

// Start serveri
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveri po punon në portin ${PORT}`));
