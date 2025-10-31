import { useState } from 'react';
import { useLibrary } from '../contexts/LibraryContext';
import { usePlayer } from '../contexts/PlayerContext';
import { Play, Plus, Heart, Music, Users, Trash2 } from 'lucide-react';
import { Playlist, Artist } from '../types';
import { useNavigate } from 'react-router-dom';

const Library = () => {
  const navigate = useNavigate();
  const { state: libraryState, createPlaylist, removePlaylist, removeArtist } = useLibrary();
  const { dispatch: playerDispatch } = usePlayer();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateForm(false);
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      playerDispatch({
        type: 'PLAY_SONG',
        payload: {
          song: playlist.songs[0],
          playlist: playlist.songs,
          index: 0
        }
      });
    }
  };

  const formatFollowers = (followers: number) => {
    if (followers >= 1000000) {
      return `${(followers / 1000000).toFixed(1)}M`;
    } else if (followers >= 1000) {
      return `${(followers / 1000).toFixed(1)}K`;
    }
    return followers.toString();
  };

    const handleViewPlaylist = (playlist: Playlist) => {
    navigate(`/playlist/${playlist.id}`);
    };


  return (
    <div className="library-page">
      <div className="library-header">
        <div className="library-header-left">
          <Heart size={32} />
          <h1>Tu Biblioteca</h1>
        </div>
        <button 
          className="create-playlist-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={20} />
          <span>Crear playlist</span>
        </button>
      </div>

      {/* Formulario para crear playlist */}
      {showCreateForm && (
        <div className="create-playlist-modal">
          <div className="modal-content">
            <h3>Crear nueva playlist</h3>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                placeholder="Nombre de la playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={!newPlaylistName.trim()}>
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sección de Playlists */}
      <section className="library-section">
        <h2>Playlists</h2>
        {libraryState.playlists.length === 0 ? (
          <div className="empty-section">
            <Music size={48} color="#b3b3b3" />
            <p>Aún no tienes playlists</p>
            <button 
              className="create-first-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Crear tu primera playlist
            </button>
          </div>
        ) : (
          <div className="playlists-grid">
            {libraryState.playlists.map((playlist: Playlist) => (
              <div key={playlist.id} className="playlist-card" onClick={() => handleViewPlaylist(playlist)}>
                <div className="playlist-image">
                    {playlist.coverUrl.includes('gradient') ? (
                    <div 
                    className="gradient-cover"
                    style={{ background: playlist.coverUrl }}
                    >
                    <Music size={32} color="#b3b3b3" />
                    </div>
                ) : (
                    <img src={playlist.coverUrl} alt={playlist.name} />
                )}
                <button 
                    className="play-button"
                    onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPlaylist(playlist);
                    }}
                    disabled={playlist.songs.length === 0}
                >
                    <Play size={24} />
                </button>
                </div>
                <div className="playlist-info">
                    <h3 className="playlist-name">{playlist.name}</h3>
                    <p className="playlist-description">
                    {playlist.description || `${playlist.songs.length} canciones`}
                    </p>
                </div>
                <button 
                    className="delete-btn"
                    onClick={(e) => {
                    e.stopPropagation();
                    removePlaylist(playlist.id);
                    }}
                    title="Eliminar playlist"
                >
                    <Trash2 size={16} />
                </button>
                </div>
            ))}
          </div>
        )}
      </section>

      {/* Sección de Artistas */}
      <section className="library-section">
        <h2>Artistas</h2>
        {libraryState.artists.length === 0 ? (
          <div className="empty-section">
            <Users size={48} color="#b3b3b3" />
            <p>Aún no sigues a ningún artista</p>
            <p className="hint">Los artistas que sigas aparecerán aquí</p>
          </div>
        ) : (
          <div className="artists-grid">
            {libraryState.artists.map((artist: Artist) => (
              <div key={artist.id} className="artist-card">
                <div className="artist-image">
                  <img src={artist.imageUrl} alt={artist.name} />
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">{artist.name}</h3>
                  <p className="artist-followers">
                    {formatFollowers(artist.followers)} seguidores
                  </p>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => removeArtist(artist.id)}
                  title="Dejar de seguir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Library;