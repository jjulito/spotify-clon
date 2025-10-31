import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import { usePlayer } from '../contexts/PlayerContext';
import { Play, Trash2, ArrowLeft, Music } from 'lucide-react';

const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: libraryState, removeSongFromPlaylist } = useLibrary();
  const { dispatch: playerDispatch } = usePlayer();

  // Buscar la playlist en las playlists del usuario
  const playlist = libraryState.playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="playlist-page">
        <div className="playlist-not-found">
          <h2>Playlist no encontrada</h2>
          <button onClick={() => navigate('/library')}>
            Volver a Tu Biblioteca
          </button>
        </div>
      </div>
    );
  }

  const handlePlayPlaylist = (startIndex: number = 0) => {
    if (playlist.songs.length === 0) return;

    playerDispatch({
      type: 'PLAY_SONG',
      payload: {
        song: playlist.songs[startIndex],
        playlist: playlist.songs,
        index: startIndex
      }
    });
  };

  const handleRemoveSong = (songId: string) => {
    removeSongFromPlaylist(playlist.id, songId);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="playlist-page">
      <div className="playlist-header">
            <button 
                className="back-button"
                onClick={() => navigate('/library')}
            >
                <ArrowLeft size={24} />
            </button>
            {playlist.coverUrl.includes('gradient') ? (
                <div 
                className="gradient-cover large"
                style={{ background: playlist.coverUrl }}
                >
                <Music size={64} color="#b3b3b3" />
                </div>
            ) : (
                <img src={playlist.coverUrl} alt={playlist.name} />
            )}
            <div className="playlist-info">
                <span className="playlist-label">PLAYLIST</span>
                <h1>{playlist.name}</h1>
                {playlist.description && <p>{playlist.description}</p>}
                <span>{playlist.songs.length} canciones</span>
            </div>
            </div>

      <div className="playlist-actions">
        <button 
          className="play-all-btn"
          onClick={() => handlePlayPlaylist(0)}
          disabled={playlist.songs.length === 0}
        >
          <Play size={24} fill="black" />
        </button>
      </div>

      <div className="playlist-tracks">
        {playlist.songs.length === 0 ? (
          <div className="empty-playlist">
            <h2>Esta playlist está vacía</h2>
            <p>Agrega canciones desde la página de búsqueda</p>
            <button onClick={() => navigate('/search')}>
              Buscar canciones
            </button>
          </div>
        ) : (
          <div className="tracks-list">
            {playlist.songs.map((song, index) => (
              <div key={song.id} className="track-row">
                <div className="track-number">
                  {index + 1}
                </div>
                <div className="track-info">
                  <img src={song.coverUrl} alt={song.album} className="track-image" />
                  <div className="track-details">
                    <div className="track-title">{song.title}</div>
                    <div className="track-artist">{song.artist}</div>
                  </div>
                </div>
                <div className="track-album">{song.album}</div>
                <div className="track-duration">
                  {formatDuration(song.duration)}
                </div>
                <div className="track-actions">
                  <button 
                    className="play-track-btn"
                    onClick={() => handlePlayPlaylist(index)}
                  >
                    <Play size={16} />
                  </button>
                  <button 
                    className="remove-song-btn"
                    onClick={() => handleRemoveSong(song.id)}
                    title="Quitar de la playlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist;