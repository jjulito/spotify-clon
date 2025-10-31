import { config } from '../config/api';

export interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  duration: number;
  preview: string;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
  };
}

export interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl: string;
  coverUrl: string;
  coverUrlMedium: string;
}

const makeRequest = async (url: string) => {
  const endpoints: { [key: string]: string } = {
    // Búsqueda normal
    '/search': `${config.api.baseURL}/api/deezer/search`,
    // Chart popular
    '/chart/0/tracks': `${config.api.baseURL}/api/deezer/chart`,
    // Búsqueda por género (manejo especial)
    'genre': `${config.api.baseURL}/api/deezer/genre`
  };

  try {
    let apiUrl: string;
    
    // Determinar qué endpoint usar basado en la URL
    if (url.includes('genre')) {
      // Extraer el género de la URL: https://api.deezer.com/search?q=genre:"pop"&limit=10
      const genreMatch = url.match(/genre:"([^"]+)"/);
      const limitMatch = url.match(/limit=(\d+)/);
      
      if (genreMatch) {
        const genre = genreMatch[1];
        const limit = limitMatch ? limitMatch[1] : '10';
        apiUrl = `${endpoints.genre}/${genre}?limit=${limit}`;
      } else {
        throw new Error('Formato de URL de género inválido');
      }
    } else if (url.includes('/search')) {
      const urlObj = new URL(`https://api.deezer.com${url}`);
      const query = urlObj.searchParams.get('q');
      const limit = urlObj.searchParams.get('limit') || '20';
      apiUrl = `${endpoints['/search']}?q=${encodeURIComponent(query || '')}&limit=${limit}`;
    } else if (url.includes('/chart')) {
      apiUrl = endpoints['/chart/0/tracks'];
    } else {
      throw new Error(`Endpoint no soportado: ${url}`);
    }

    console.log('🔗 Haciendo request a:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  console.error('❌ Error con API propia:', errorMessage);
  
  // Fallback a proxies públicos solo si es desarrollo
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    console.log('🔄 Intentando con proxies públicos...');
    return await tryPublicProxies(url);
  }
  
  throw new Error('No se pudo conectar con el servidor');
 }
};

const tryPublicProxies = async (url: string) => {
  const publicProxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];

  for (const proxyUrl of publicProxies) {
    try {
      console.log('🔄 Intentando proxy público:', proxyUrl);
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Proxy público exitoso');
        return data.contents ? JSON.parse(data.contents) : data;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.log(`❌ Proxy público falló:`, errorMessage);
      continue;
    }
  }
  
  throw new Error('Todos los métodos de conexión fallaron');
};

export const searchTracks = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  try {
    console.log('🎵 Buscando canciones reales para:', query);
    
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=25`;
    const data = await makeRequest(deezerUrl);
    
    console.log('📊 Resultados brutos de Deezer:', data.data.length);

    // Filtrar solo tracks que tienen preview disponible
    const tracksWithPreview = data.data.filter((track: DeezerTrack) => {
      const hasPreview = !!track.preview;
      if (hasPreview) {
        console.log(`✅ Preview disponible: "${track.title}" - ${track.artist.name}`);
      }
      return hasPreview;
    });

    console.log(`🎧 Encontrados ${tracksWithPreview.length} canciones con preview de ${data.data.length} totales`);

    // Mostrar información de los primeros tracks para debug
    if (tracksWithPreview.length > 0) {
      console.log('🔥 Canciones con preview disponible:');
      tracksWithPreview.slice(0, 5).forEach((track: DeezerTrack, index: number) => {
        console.log(`   ${index + 1}. "${track.title}" - ${track.artist.name}`);
        console.log(`      Preview URL: ${track.preview}`);
      });
    } else {
      console.warn('⚠️ No se encontraron canciones con preview disponible');
      // Mostrar algunas canciones sin preview para debug
      data.data.slice(0, 3).forEach((track: DeezerTrack, index: number) => {
        console.log(`   ${index + 1}. "${track.title}" - ${track.artist.name} | Preview: ${track.preview ? 'SÍ' : 'NO'}`);
      });
    }

    return tracksWithPreview.map((track: DeezerTrack) => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      duration: track.duration,
      previewUrl: track.preview,
      coverUrl: track.album.cover_medium,
      coverUrlMedium: track.album.cover_medium
    }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error buscando canciones reales:', errorMessage);
    throw new Error('No se pudieron cargar canciones reales. Intenta recargar la página.');
  }
};

export const getPopularTracks = async (): Promise<SearchResult[]> => {
  try {
    console.log('🎵 Obteniendo canciones populares de Deezer...');
    
    const deezerUrl = 'https://api.deezer.com/chart/0/tracks?limit=20';
    const data = await makeRequest(deezerUrl);
    
    console.log('🔥 Canciones populares encontradas:', data.data.length);

    // Filtrar solo tracks con preview disponible
    const tracksWithPreview = data.data.filter((track: DeezerTrack) => track.preview);
    
    console.log(`🎧 ${tracksWithPreview.length} canciones con preview disponible`);

    return tracksWithPreview.map((track: DeezerTrack) => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      duration: track.duration,
      previewUrl: track.preview,
      coverUrl: track.album.cover_medium,
      coverUrlMedium: track.album.cover_medium
    }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error obteniendo canciones populares:', errorMessage);
    
    // Fallback con datos mock en español
    return getSpanishMockTracks();
  }
};

export const searchTracksByGenre = async (genre: string, limit: number = 10): Promise<SearchResult[]> => {
  try {
    console.log(`🎵 Buscando canciones de ${genre}...`);
    
    const deezerUrl = `https://api.deezer.com/search?q=genre:"${encodeURIComponent(genre)}"&limit=${limit}`;
    const data = await makeRequest(deezerUrl);
    
    console.log(`🔥 Encontradas ${data.data.length} canciones de ${genre}`);

    // Filtrar solo tracks con preview disponible
    const tracksWithPreview = data.data.filter((track: DeezerTrack) => track.preview);
    
    console.log(`🎧 ${tracksWithPreview.length} canciones con preview disponible de ${genre}`);

    return tracksWithPreview.map((track: DeezerTrack) => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      duration: track.duration,
      previewUrl: track.preview,
      coverUrl: track.album.cover_medium,
      coverUrlMedium: track.album.cover_medium
    }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`❌ Error buscando canciones de ${genre}:`, errorMessage);
    
    // Fallback con datos mock
    return getGenreMockTracks(genre);
  }
};

// Datos mock en español como fallback para canciones populares
const getSpanishMockTracks = (): SearchResult[] => {
  return [
    {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 200,
      previewUrl: '',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      coverUrlMedium: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Save Your Tears',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 215,
      previewUrl: '',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      coverUrlMedium: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      duration: 203,
      previewUrl: '',
      coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
      coverUrlMedium: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop'
    },
    {
      id: '4',
      title: 'Don\'t Start Now',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      duration: 183,
      previewUrl: '',
      coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
      coverUrlMedium: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop'
    }
  ];
};

// Datos mock por género como fallback
const getGenreMockTracks = (genre: string): SearchResult[] => {
  const mockTracks: { [key: string]: SearchResult[] } = {
    pop: [
      {
        id: 'pop-1',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200,
        previewUrl: '',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        coverUrlMedium: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
      },
      {
        id: 'pop-2',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 203,
        previewUrl: '',
        coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
        coverUrlMedium: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop'
      }
    ],
    rock: [
      {
        id: 'rock-1',
        title: 'Sweet Child O\'Mine',
        artist: 'Guns N\' Roses',
        album: 'Appetite for Destruction',
        duration: 356,
        previewUrl: '',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        coverUrlMedium: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
      }
    ],
    hiphop: [
      {
        id: 'hiphop-1',
        title: 'God\'s Plan',
        artist: 'Drake',
        album: 'Scorpion',
        duration: 198,
        previewUrl: '',
        coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
        coverUrlMedium: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
      }
    ],
    electronic: [
      {
        id: 'electronic-1',
        title: 'Strobe',
        artist: 'deadmau5',
        album: 'For Lack of a Better Name',
        duration: 634,
        previewUrl: '',
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop',
        coverUrlMedium: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop'
      }
    ],
    latin: [
      {
        id: 'latin-1',
        title: 'Despacito',
        artist: 'Luis Fonsi',
        album: 'Vida',
        duration: 229,
        previewUrl: '',
        coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop',
        coverUrlMedium: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop'
      }
    ],
    chill: [
      {
        id: 'chill-1',
        title: 'Sunset Lover',
        artist: 'Petit Biscuit',
        album: 'Sunset Lover',
        duration: 183,
        previewUrl: '',
        coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
        coverUrlMedium: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop'
      }
    ]
  };

  return mockTracks[genre] || mockTracks.pop;
};