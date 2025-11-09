import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

// 🔑 Vendos këtu API KEY që ke nga API-Football
const API_KEY = "8a0ecad2149f5ccf5da3c61dbaacf6b9";

// Endpoint për ndeshjet live
app.get("/matches", async (req, res) => {
  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gabim API: ${response.status} - ${text}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Gabim:", err.message);
    res.status(500).json({ error: "Nuk u morën ndeshjet." });
  }
});

// Starto serverin
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveri po punon në portin ${PORT}`));
