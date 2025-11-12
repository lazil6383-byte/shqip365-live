import express from "express";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// BASE PIRATE API
const BASE = "https://livescore-api.pirateweb.net/v1";

// Test API
app.get("/api/test", (req, res) => {
  res.json({ message: "API working 🚀" });
});

// LIVE
app.get("/api/live", async (req, res) => {
  const data = await fetch(`${BASE}/live`).then(r => r.json());
  res.json(data);
});

// UPCOMING
app.get("/api/upcoming", async (req, res) => {
  const data = await fetch(`${BASE}/upcoming`).then(r => r.json());
  res.json(data);
});

// FINISHED
app.get("/api/finished", async (req, res) => {
  const data = await fetch(`${BASE}/finished`).then(r => r.json());
  res.json(data);
});

// TODAY
app.get("/api/matches", async (req, res) => {
  const data = await fetch(`${BASE}/today`).then(r => r.json());
  res.json(data);
});

// MATCHES BY LEAGUE
app.get("/api/matches/:leagueId", async (req, res) => {
  const leagueId = req.params.leagueId;
  const data = await fetch(`${BASE}/league/${leagueId}`).then(r => r.json());
  res.json(data);
});

// Default route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
