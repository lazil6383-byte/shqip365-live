const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// SPORTYBET KE BASE API
const BASE_URL = "https://www.sportybet.com/api/ng"; 
// e ndryshojmë për KE kur ta testojmë që del 100% OK

// 1️⃣ MERR NDESHJE LIVE
app.get("/api/live", async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/match/live`);
        res.json(response.data.data);
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// 2️⃣ MERR NDESHJE UPCOMING
app.get("/api/upcoming", async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/match/upcoming`);
        res.json(response.data.data);
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// 3️⃣ MERR KOEFICIENTËT E NJË NDESHJEJE
app.get("/api/details/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const response = await axios.get(`${BASE_URL}/match/details?match_id=${id}`);
        res.json(response.data.data);
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// START SERVER
app.listen(3000, () => console.log("API Running on port 3000"));
