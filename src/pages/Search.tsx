import { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, Play, Heart, AlertCircle, Users, UserPlus, UserCheck, ListMusic, Music } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { searchTracks, SearchResult } from '../services/deezerService';
import { usePlayer } from '../contexts/PlayerContext';
import { Song, Playlist, Artist } from '../types';
import { useLibrary } from '../contexts/LibraryContext';

const Search = () => {
  const { addArtist, state: libraryState, addSongToPlaylist } = useLibrary();
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SearchResult | null>(null);
  const { dispatch, toggleLike, likedSongs } = usePlayer();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setTracks([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const results = await searchTracks(searchQuery);
      setTracks(results);
      if (results.length === 0) {
        setError(`No se encontraron resultados para "${searchQuery}"`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error al buscar canciones. Verifica tu conexión e intenta nuevamente.');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handlePlayTrack = (track: SearchResult, allTracks: SearchResult[]) => {
    if (!track.previewUrl) {
      alert('Esta canción no tiene preview disponible');
      return;
    }

    const song: Song = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      coverUrl: track.coverUrl,
      audioUrl: track.previewUrl
    };

    // Convertir todos los tracks a formato Song para la playlist
    const playlist: Song[] = allTracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      coverUrl: t.coverUrl,
      audioUrl: t.previewUrl
    }));

    const currentIndex = allTracks.findIndex(t => t.id === track.id);

    dispatch({
      type: 'PLAY_SONG',
      payload: {
        song,
        playlist,
        index: currentIndex
      }
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Función para verificar si ya se sigue al artista
  const isArtistFollowed = (artistName: string) => {
    return libraryState.artists.some((artist: Artist) => artist.name === artistName);
  };

  // Función para toggle follow artista
  const toggleFollowArtist = (artistName: string, track: SearchResult) => {
    if (isArtistFollowed(artistName)) {
      alert(`Ya sigues a ${artistName}`);
      return;
    }

    const newArtist: Artist = {
      id: `artist-${Date.now()}`,
      name: artistName,
      imageUrl: track.coverUrl,
      followers: Math.floor(Math.random() * 1000000) + 10000 // nota: los followers aleatorios
    };

    addArtist(newArtist);
    alert(`¡Ahora sigues a ${artistName}!`);
  };

  // Función para manejar like de canción
  const handleLikeTrack = (track: SearchResult) => {
    const song: Song = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      coverUrl: track.coverUrl,
      audioUrl: track.previewUrl
    };

    toggleLike(song);
  };

  // Verificar si una canción está en liked
  const isTrackLiked = (trackId: string) => {
    return likedSongs.some(song => song.id === trackId);
  };

  // Función para mostrar modal de agregar a playlist
  const handleShowAddToPlaylist = (track: SearchResult) => {
    setSelectedTrack(track);
    setShowAddToPlaylist(true);
  };

  // Función para agregar canción a playlist
  const handleAddToPlaylist = (playlistId: string) => {
    if (selectedTrack) {
      const song: Song = {
        id: selectedTrack.id,
        title: selectedTrack.title,
        artist: selectedTrack.artist,
        album: selectedTrack.album,
        duration: selectedTrack.duration,
        coverUrl: selectedTrack.coverUrl,
        audioUrl: selectedTrack.previewUrl
      };

      addSongToPlaylist(playlistId, song);
      setShowAddToPlaylist(false);
      setSelectedTrack(null);
      alert(`"${selectedTrack.title}" agregada a la playlist`);
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <SearchIcon size={24} />
        <input
          type="text"
          placeholder="Busca artistas, canciones o álbumes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="search-content">
        {!hasSearched && query.length === 0 && (
          <div className="search-placeholder">
            <h2>Explorar todo</h2>
            <div className="categories-grid">
              <div className="category-card" onClick={() => setQuery('The Weeknd')}>The Weeknd</div>
              <div className="category-card" onClick={() => setQuery('Dua Lipa')}>Dua Lipa</div>
              <div className="category-card" onClick={() => setQuery('Bad Bunny')}>Bad Bunny</div>
              <div className="category-card" onClick={() => setQuery('Taylor Swift')}>Taylor Swift</div>
              <div className="category-card" onClick={() => setQuery('Ed Sheeran')}>Ed Sheeran</div>
              <div className="category-card" onClick={() => setQuery('Billie Eilish')}>Billie Eilish</div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Buscando canciones reales...</p>
          </div>
        )}

        {tracks.length > 0 && (
          <div className="search-results">
            <h2>Resultados para "{query}"</h2>
            <p className="results-count">{tracks.length} canciones encontradas</p>
            <div className="tracks-list">
              {tracks.map((track, index) => (
                <div key={track.id} className="track-row">
                  <div className="track-number">
                    {index + 1}
                  </div>
                  <div className="track-info">
                    <img
                      src={track.coverUrl}
                      alt={track.album}
                      className="track-image"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300';
                      }}
                    />
                    <div className="track-details">
                      <div className="track-title">{track.title}</div>
                      <div className="track-artist">{track.artist}</div>
                    </div>
                  </div>
                  <div className="track-album">{track.album}</div>
                  <div className="track-duration">
                    {formatDuration(track.duration)}
                  </div>
                  <div className="track-actions">
                    <button
                      className="play-track-btn"
                      onClick={() => handlePlayTrack(track, tracks)}
                      disabled={!track.previewUrl}
                      title={track.previewUrl ? "Reproducir preview" : "Preview no disponible"}
                    >
                      <Play size={16} />
                    </button>
                    <button
                      className="like-track-btn"
                      onClick={() => handleLikeTrack(track)}
                      title={isTrackLiked(track.id) ? "Quitar de Tus Me Gusta" : "Agregar a Tus Me Gusta"}
                    >
                      <Heart
                        size={16}
                        fill={isTrackLiked(track.id) ? '#1db954' : 'none'}
                        color={isTrackLiked(track.id) ? '#1db954' : '#b3b3b3'}
                      />
                    </button>
                    <button
                      className="add-to-playlist-btn"
                      onClick={() => handleShowAddToPlaylist(track)}
                      title="Agregar a playlist"
                    >
                      <ListMusic size={16} />
                    </button>
                    <button
                      className="follow-artist-btn"
                      onClick={() => toggleFollowArtist(track.artist, track)}
                      disabled={isArtistFollowed(track.artist)}
                      title={isArtistFollowed(track.artist) ? "Ya sigues a este artista" : "Seguir artista"}
                    >
                      {isArtistFollowed(track.artist) ?
                        <UserCheck size={16} /> :
                        <UserPlus size={16} />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de agregar a playlist */}
      {showAddToPlaylist && selectedTrack && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar a playlist</h3>
            <p>Selecciona una playlist para "{selectedTrack.title}"</p>

            {libraryState.playlists.length === 0 ? (
              <div className="no-playlists">
                <p>No tienes playlists creadas</p>
                <Link
                  to="/library"
                  className="go-to-library-btn"
                  onClick={() => setShowAddToPlaylist(false)}
                  style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
                >
                  Crear playlist en Tu Biblioteca
                </Link>
              </div>
            ) : (
              <div className="playlists-list">
                {libraryState.playlists.map((playlist: Playlist) => (
                  <div
                    key={playlist.id}
                    className="playlist-option"
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    {playlist.coverUrl.includes('gradient') ? (
                      <div
                        className="gradient-cover small"
                        style={{ background: playlist.coverUrl }}
                      >
                        <Music size={20} color="#b3b3b3" />
                      </div>
                    ) : (
                      <img src={playlist.coverUrl} alt={playlist.name} />
                    )}
                    <div className="playlist-info">
                      <span className="playlist-name">{playlist.name}</span>
                      <span className="playlist-songs">{playlist.songs.length} canciones</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button
                onClick={() => setShowAddToPlaylist(false)}
                className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
