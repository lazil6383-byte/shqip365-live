import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

// 🔑 Vendos API KEY tënden këtu
const API_KEY = "8a0ecad2149f5ccf5da3c61dbaacf6b9";

// Endpoint për ndeshjet (live, upcoming, finished)
app.get("/matches", async (req, res) => {
  const type = req.query.type || "live";
  let url = "";

  if (type === "live") {
    url = "https://v3.football.api-sports.io/fixtures?live=all";
  } else if (type === "upcoming") {
    url = "https://v3.football.api-sports.io/fixtures?next=10";
  } else {
    url = "https://v3.football.api-sports.io/fixtures?last=10";
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "x-apisports-key": API_KEY }
    });

    const data = await response.json();

    // kontrollo nëse API ka dhënë ndonjë error
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("❌ API Error:", data.errors);
      return res.status(500).json({ error: "Gabim nga API-Football" });
    }

    // Dërgo të dhënat te faqja
    res.json(data);

  } catch (error) {
    console.error("❌ Gabim gjatë marrjes së ndeshjeve:", error);
    res.status(500).json({ error: "Gabim gjatë marrjes së ndeshjeve" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Serveri po punon në portin ${PORT}`));
