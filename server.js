import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Route kryesore
app.get("/", (req, res) => {
  res.send({ status: "API running" });
});

// 🔥 API E RE (test por FUNKSIONALE)
const PIRATE_URL = "https://api.jsonbin.io/v3/b/66ba6fa9e41b4d34e43a0e3f";

// /live – ndeshjet live
app.get("/live", async (req, res) => {
  try {
    const response = await fetch(PIRATE_URL);

    if (!response.ok) {
      return res.status(500).json({ error: "API returned an error" });
    }

    const body = await response.json();

    const matches = body.record?.data || [];

    const liveMatches = matches.filter(m => m.status === "LIVE");

    res.json({ data: liveMatches });

  } catch (err) {
    console.error("LIVE ERROR:", err);
    res.status(500).json({ error: "Error fetching live matches" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
