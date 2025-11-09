import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const API_KEY = "263701d881c64474becfc922b7dd95a6"; // vendos këtu API key tënden

app.get("/matches", async (req, res) => {
  const type = req.query.type || "live";
  let endpoint = "";

  if (type === "live") {
    endpoint = "https://v3.football.api-sports.io/fixtures?live=all";
  } else if (type === "upcoming") {
    endpoint = "https://v3.football.api-sports.io/fixtures?next=20";
  } else if (type === "finished") {
    endpoint = "https://v3.football.api-sports.io/fixtures?last=20";
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gabim gjatë marrjes së të dhënave:", error);
    res.status(500).json({ error: "Nuk u morën të dhënat nga API" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
