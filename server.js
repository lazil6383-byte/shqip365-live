import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const API_KEY = "263701d881c64474becfc922b7dd95a6"; // vendose API key-in tënd këtu

// Funksion ndihmës për të marrë datën e nesërme
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

app.get("/matches", async (req, res) => {
  const type = req.query.type || "live";
  let endpoint = "";

  try {
    if (type === "live") {
      // 1️⃣ Fillimisht marrim ndeshjet live
      endpoint = "https://v3.football.api-sports.io/fixtures?live=all";
      let response = await fetch(endpoint, {
        headers: { "x-apisports-key": API_KEY },
      });
      let data = await response.json();

      // 2️⃣ Nëse s’ka live, kalojmë te ndeshjet e nesërme
      if (!data.response || data.response.length === 0) {
        const tomorrow = getTomorrowDate();
        endpoint = `https://v3.football.api-sports.io/fixtures?date=${tomorrow}`;
        response = await fetch(endpoint, {
          headers: { "x-apisports-key": API_KEY },
        });
        data = await response.json();
      }

      res.json(data);
    } else if (type === "upcoming") {
      const tomorrow = getTomorrowDate();
      endpoint = `https://v3.football.api-sports.io/fixtures?date=${tomorrow}`;
      const response = await fetch(endpoint, {
        headers: { "x-apisports-key": API_KEY },
      });
      const data = await response.json();
      res.json(data);
    } else if (type === "finished") {
      endpoint = "https://v3.football.api-sports.io/fixtures?last=20";
      const response = await fetch(endpoint, {
        headers: { "x-apisports-key": API_KEY },
      });
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error("Gabim:", error);
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
