import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

// 🔑 Vendos API KEY që ke nga API-Football
const API_KEY = "263701d881c64474becfc922b7dd95a6"; // zëvendësoje me tënden nëse është ndryshe

// Endpoint për ndeshjet
app.get("/matches", async (req, res) => {
  const type = req.query.type || "live";
  let status = "live";

  if (type === "upcoming") status = "scheduled";
  else if (type === "finished") status = "finished";

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?live=${status}`, {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gabim gjatë marrjes së të dhënave:", error);
    res.status(500).json({ error: "Nuk u morën të dhënat" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Serveri po punon në portin ${PORT}`));
