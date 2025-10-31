const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://jjulito.github.io',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Proxy para Deezer API
app.get('/api/deezer/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error en proxy:', error);
    res.status(500).json({ error: 'Error al buscar en Deezer' });
  }
});

app.get('/api/deezer/chart', async (req, res) => {
  try {
    const response = await fetch('https://api.deezer.com/chart/0/tracks?limit=20');
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error en proxy:', error);
    res.status(500).json({ error: 'Error al obtener chart' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
});