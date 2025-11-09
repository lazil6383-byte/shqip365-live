// ===========================
//  SERVER.JS – Shqip365 LIVE
// ===========================

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.static('public'));

// 🔑 API Key nga API-FOOTBALL
const API_KEY = '8a0ecad2149f5ccf5da3c61dbaacf6b9';  // <--- Ndrysho këtë me çelësin tënd
const BASE_URL = 'https://v3.football.api-sports.io';

// ✅ Endpoint për ndeshje live
app.get('/api/matches', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures?live=all`, {
      headers: { 'x-apisports-key': API_KEY }
    });
    res.json(response.data);
  } catch (err) {
    console.error('❌ Gabim:', err.message);
    res.status(500).json({ error: 'Gabim gjatë marrjes së ndeshjeve live.' });
  }
});

// ✅ Endpoint për ndeshje të ardhshme
app.get('/api/upcoming', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures?next=20`, {
      headers: { 'x-apisports-key': API_KEY }
    });
    res.json(response.data);
  } catch (err) {
    console.error('❌ Gabim:', err.message);
    res.status(500).json({ error: 'Gabim gjatë marrjes së ndeshjeve të ardhshme.' });
  }
});

// Server port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveri u nis në portën ${PORT}`));
