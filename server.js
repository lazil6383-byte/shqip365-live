import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send({ status: "API running" });
});

// PIRATE API URL
const PIRATE_URL = "https://livescore-api.vercel.app/matches";

// Route për ndeshjet live
app.get("/live", async (req, res) => {
  try {
    const response = await fetch(PIRATE_URL);
    const data = await response.json();

    if (!data || !data.data) {
      return res.json({ data: [] });
    }

    // Filter vetëm ndeshjet LIVE
    const liveMatches = data.data.filter(m => m.status === "LIVE");

    res.json({ data: liveMatches });
  } catch (err) {
    res.status(500).json({ error: "Error fetching live matches" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
