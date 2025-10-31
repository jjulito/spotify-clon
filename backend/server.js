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

// Proxy para Deezer API - Búsqueda
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

// Proxy para Deezer API - Chart
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

// Proxy para Deezer API - Búsqueda por género (NUEVO ENDPOINT)
app.get('/api/deezer/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 10 } = req.query;
    
    const response = await fetch(`https://api.deezer.com/search?q=genre:"${encodeURIComponent(genre)}"&limit=${limit}`);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error en proxy de género:', error);
    res.status(500).json({ error: 'Error al buscar por género en Deezer' });
  }
});

// Ruta de salud opcional
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Spotify Clone Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz opcional
app.get('/', (req, res) => {
  res.json({
    message: 'Spotify Clone Backend API',
    status: 'running',
    endpoints: {
      search: '/api/deezer/search?q=query',
      chart: '/api/deezer/chart',
      genre: '/api/deezer/genre/:genre',
      health: '/health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
});