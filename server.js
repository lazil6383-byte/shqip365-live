// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

// NËSE KE SCRAPER, mund ta shtosh më poshtë.
// Për tani po lëmë një shembull me ndeshje "fake".

const app = express();
const PORT = process.env.PORT || 10000;

// ====== STATIC FILES (/public) ======
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.use(cors());

// ====== DATA SHEMBULL (deri sa të lidhim scraperin) ======
const demoMatches = [
  {
    league: "International Soccer",
    date: "Thu 13 Nov",
    home: "Suriname",
    away: "El Salvador",
    time: "17:17",
    live: true,
    odds: { home: 1.9, draw: 3.1, away: 4.75 }
  },
  {
    league: "International Soccer",
    date: "Fri 14 Nov",
    home: "Canada",
    away: "Ecuador",
    time: "01:30",
    live: false,
    odds: { home: 2.9, draw: 2.87, away: 2.5 }
  },
  {
    league: "International Soccer",
    date: "Fri 14 Nov",
    home: "Trinidad & Tobago",
    away: "Jamaica",
    time: "01:30",
    live: false,
    odds: { home: 3.4, draw: 3.4, away: 2.1 }
  },
  {
    league: "International Soccer",
    date: "Fri 14 Nov",
    home: "Bermuda",
    away: "Curacao",
    time: "01:00",
    live: false,
    odds: { home: 11.0, draw: 5.75, away: 1.22 }
  },
  {
    league: "International Soccer",
    date: "Fri 14 Nov",
    home: "Haiti",
    away: "Costa Rica",
    time: "03:00",
    live: false,
    odds: { home: 4.0, draw: 3.5, away: 2.0 }
  }
];

// ====== API – këtu më vonë fut scraperin Shqip365 ======
app.get("/api/matches", (req, res) => {
  res.json(demoMatches);
});

// Mund të mbash edhe endpointet e tjera ekzistuese:
// app.get("/api/live", ...)
// app.get("/api/upcoming", ...)
// etj.

// ====== FRONTEND – index.html ======
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`Shqip365 Live API running on port ${PORT}`);
});
