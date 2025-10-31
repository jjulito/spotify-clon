import { useState, useEffect } from 'react';
import { PlaylistCard } from '../components/Music/PlaylistCard';
import { getPopularTracks, searchTracksByGenre, SearchResult } from '../services/deezerService';
import { usePlayer } from '../contexts/PlayerContext';
import { Song } from '../types';
import { Play } from 'lucide-react';

const Home = () => {
  const [featuredTracks, setFeaturedTracks] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [genreTracks, setGenreTracks] = useState<{ [key: string]: SearchResult[] }>({});
  const { dispatch } = usePlayer();

  // Playlists por género con mapeo a términos de búsqueda de Deezer
  const genrePlaylists = [
    {
      id: 'pop',
      name: 'Pop Hits',
      description: 'Los éxitos pop del momento',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      searchTerm: 'pop'
    },
    {
      id: 'rock',
      name: 'Rock Clásico', 
      description: 'Los mejores clásicos del rock',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      searchTerm: 'rock'
    },
    {
      id: 'hiphop',
      name: 'Hip Hop Essentials',
      description: 'Lo esencial del hip hop',
      coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      searchTerm: 'hip hop'
    },
    {
      id: 'electronic',
      name: 'Electrónica',
      description: 'Los mejores beats electrónicos',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop',
      searchTerm: 'electronic'
    },
    {
      id: 'latin',
      name: 'Latino',
      description: 'Los ritmos latinos más populares',
      coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop',
      searchTerm: 'latin'
    },
    {
      id: 'chill',
      name: 'Chill Vibes',
      description: 'Música relajante para cualquier momento',
      coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
      searchTerm: 'chill'
    }
  ];

  useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const popularTracks = await getPopularTracks();
      setFeaturedTracks(popularTracks.slice(0, 6));
      const genresToLoad = ['pop', 'rock', 'hiphop'];
      const genrePromises = genresToLoad.map(genre => 
        searchTracksByGenre(genre, 5)
      );

      const genreResults = await Promise.all(genrePromises);
      
      const genreData: { [key: string]: SearchResult[] } = {};
      genresToLoad.forEach((genre, index) => {
        genreData[genre] = genreResults[index];
      });

      setGenreTracks(genreData);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error loading data:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  const handlePlayTrack = (track: SearchResult | Song, allTracks: SearchResult[] | Song[] = []) => {
  
  const hasAudioUrl = ('audioUrl' in track && track.audioUrl) || ('previewUrl' in track && track.previewUrl);
  
  if (!hasAudioUrl) {
    alert('Esta canción no tiene preview disponible');
    return;
  }

  let song: Song;
  let playlist: Song[];

  // Convertir a formato Song estándar
  if ('previewUrl' in track) {
    // si es SearchResult entonces convertir a Song
    const searchResult = track as SearchResult;
    song = {
      id: searchResult.id,
      title: searchResult.title,
      artist: searchResult.artist,
      album: searchResult.album,
      duration: searchResult.duration,
      coverUrl: searchResult.coverUrl,
      audioUrl: searchResult.previewUrl
    };

    // Convertir toda la playlist si es necesario
    playlist = (allTracks as SearchResult[]).map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      coverUrl: t.coverUrl,
      audioUrl: t.previewUrl
    }));
  } else {
    // si ya es Song entonces usar directamente
    song = track as Song;
    playlist = allTracks as Song[];
  }

  const currentIndex = playlist.findIndex(t => t.id === song.id);
  
  dispatch({ 
    type: 'PLAY_SONG', 
    payload: {
      song,
      playlist,
      index: currentIndex
    }
  });
};

const handlePlayRandomFromGenre = async (genre: string) => {
  try {
    // Si ya tenemos canciones cargadas para este género, usar esas
    if (genreTracks[genre] && genreTracks[genre].length > 0) {
      const tracks = genreTracks[genre];
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      handlePlayTrack(randomTrack, tracks);
      return;
    }

    // Si no, cargar canciones del género
    console.log(`🎲 Cargando canción aleatoria de ${genre}...`);
    const tracks = await searchTracksByGenre(genre, 10);
    
    if (tracks.length > 0) {
      // Actualizar el estado con las nuevas canciones
      setGenreTracks(prev => ({
        ...prev,
        [genre]: tracks
      }));

      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      handlePlayTrack(randomTrack, tracks);
    } else {
      alert(`No se encontraron canciones de ${genre} con preview disponible`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error playing random track from ${genre}:`, errorMessage);
    alert(`Error al reproducir música de ${genre}`);
  }
};

  return (
    <div className="home">
      <section className="welcome-section">
        <h1>Buenas tardes</h1>
        {loading ? (
          <div className="loading-tracks">
            <div className="loading-spinner"></div>
            <p>Cargando música...</p>
          </div>
        ) : featuredTracks.length > 0 ? (
          <div className="quick-access-grid">
            {featuredTracks.slice(0, 6).map((track, index) => (
              <div 
                key={track.id} 
                className="quick-access-card"
                onClick={() => handlePlayTrack(track, featuredTracks)}
              >
                <img src={track.coverUrl} alt={track.album} />
                <div className="track-info">
                  <span className="track-title">{track.title}</span>
                  <span className="track-artist">{track.artist}</span>
                </div>
                <button className="quick-play-btn">
                  <Play size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tracks">
            <p>No se pudieron cargar las canciones</p>
          </div>
        )}
      </section>

      <section className="featured-playlists">
        <h2>Playlists para ti</h2>
        <div className="playlists-grid">
          {genrePlaylists.map(playlist => (
            <div key={playlist.id} className="playlist-card-wrapper">
            <PlaylistCard 
                playlist={{
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                coverUrl: playlist.coverUrl,
                songs: (genreTracks[playlist.id] || []).map(track => ({
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    album: track.album,
                    duration: track.duration,
                    coverUrl: track.coverUrl,
                    audioUrl: track.previewUrl
                }))
                }} 
                onPlay={() => handlePlayRandomFromGenre(playlist.id)}
            />
            </div>
          ))}
        </div>
      </section>

      {featuredTracks.length > 0 && (
        <section className="popular-tracks">
          <h2>Trending en tu país</h2>
          <div className="tracks-grid">
            {featuredTracks.map(track => (
              <div key={track.id} className="track-card">
                <div className="track-image">
                  <img src={track.coverUrl} alt={track.album} />
                  <button 
                    className="play-button"
                    onClick={() => handlePlayTrack(track, featuredTracks)}
                    disabled={!track.previewUrl}
                  >
                    <Play size={16} />
                  </button>
                </div>
                <div className="track-details">
                  <h4 className="track-title">{track.title}</h4>
                  <p className="track-artist">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;