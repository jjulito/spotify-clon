const isProduction = process.env.NODE_ENV === 'production';

export const API_BASE_URL = isProduction 
  ? 'https://tu-backend.onrender.com'  // TO-DO reemplazar luego
  : 'http://localhost:3001';

export const config = {
  api: {
    baseURL: API_BASE_URL,
    timeout: 10000
  }
};