import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// PORT
const PORT = process.env.PORT || 3000;

// ROUTE HOME
app.get("/", (req, res) => {
  res.send({ status: "API running" });
});

// API E RE (JSONBIN)
const PIRATE_URL = "https://api.jsonbin.io/v3/b/66ba6fa9e41b4d34643a0e3f"; 

// ROUTE /live
app.get("/live", async (req, res) => {
  try {
    const response = await fetch(PIRATE_URL);

    if (!response.ok) {
      return res.status(500).json({
        error: "API returned an error",
        status: response.status
      });
    }

    const json = await response.json();

    // JSONBin kthen: { record: { data: [...] } }
    const matches = json.record?.data || [];

    // Filtron vetëm ndeshjet LIVE
    const liveMatches = matches.filter(m => m.status === "LIVE");

    res.json({ data: liveMatches });

  } catch (err) {
    res.status(500).json({ error: "Error fetching live matches", details: err.message });
  }
});

// RUN SERVER
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
