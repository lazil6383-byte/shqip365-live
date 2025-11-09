// Importojmë modulet e nevojshme
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Krijojmë aplikacionin Express
const app = express();

// Aktivizojmë CORS dhe vendosim dosjen publike
app.use(cors());
app.use(express.static('public'));

// Këtu vendos API KEY që more nga API-Football
const API_KEY = 'VENDOS_KETU_API_KEY_TËND';  // 🔹 Shkruaje brenda këtyre thonjëzave ''
const BASE_URL = '8a0ecad2149f5ccf5da3c61dbaacf6b9';

// Krijojmë një endpoint për të marrë ndeshjet live
app.get('/api/matches', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures?live=all`, {
      headers: { 'x-apisports-key': API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gabim në marrjen e të dhënave nga API' });
  }
});

// Nisim serverin
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveri po punon në portën ${PORT}`));
