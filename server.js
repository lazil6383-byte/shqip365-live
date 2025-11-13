import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// API PIRATE URL
const API_URL = "https://livescore-api-pro.piratehost.net/api";

// UNIVERSAL FETCHER
async function getData(endpoint) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`);
        const json = await res.json();
        return json;
    } catch (err) {
        return { data: [] };
    }
}

// ENDPOINTET
app.get('/api/live', async (req, res) => {
    const data = await getData("/live");
    res.json(data);
});

app.get('/api/upcoming', async (req, res) => {
    const data = await getData("/fixtures");
    res.json(data);
});

app.get('/api/finished', async (req, res) => {
    const data = await getData("/results");
    res.json(data);
});

// RUN
app.listen(10000, () => console.log("API running on port 10000"));
