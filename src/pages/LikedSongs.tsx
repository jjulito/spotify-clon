import { usePlayer } from '../contexts/PlayerContext';
import { Play, Heart } from 'lucide-react';

const LikedSongs = () => {
  const { likedSongs, dispatch } = usePlayer();

  const playLikedSongs = (startIndex: number = 0) => {
    if (likedSongs.length === 0) return;

    dispatch({
      type: 'PLAY_SONG',
      payload: {
        song: likedSongs[startIndex],
        playlist: likedSongs,
        index: startIndex
      }
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="liked-songs-page">
      <div className="liked-songs-header">
        <div className="liked-songs-cover">
          <Heart size={64} fill="#1db954" color="#1db954" />
        </div>
        <div className="liked-songs-info">
          <span className="playlist-label">PLAYLIST</span>
          <h1>Tus Me Gusta</h1>
          <p>{likedSongs.length} canciones</p>
        </div>
      </div>

      <div className="liked-songs-actions">
        <button 
          className="play-all-btn"
          onClick={() => playLikedSongs(0)}
          disabled={likedSongs.length === 0}
        >
          <Play size={24} fill="black" />
        </button>
      </div>

      <div className="liked-songs-list">
        {likedSongs.length === 0 ? (
          <div className="empty-liked-songs">
            <Heart size={48} color="#b3b3b3" />
            <h2>Tu música favorita vive aquí</h2>
            <p>Guarda canciones que te gusten haciendo clic en el corazón</p>
          </div>
        ) : (
          <div className="tracks-list">
            {likedSongs.map((song, index) => (
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
                    onClick={() => playLikedSongs(index)}
                  >
                    <Play size={16} />
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

export default LikedSongs;