import { Play } from 'lucide-react';
import { Playlist } from '../../types';
import { usePlayer } from '../../contexts/PlayerContext';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay?: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onPlay }) => {
  const { dispatch } = usePlayer();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onPlay) {
      onPlay();
    } else if (playlist.songs.length > 0) {
      dispatch({ 
        type: 'PLAY_SONG', 
        payload: {
          song: playlist.songs[0],
          playlist: playlist.songs,
          index: 0
        }
      });
    }
  };

  return (
    <div className="playlist-card">
      <div className="playlist-image">
        <img 
          src={playlist.coverUrl} 
          alt={playlist.name}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300';
          }}
        />
        <button 
          className="play-button" 
          onClick={handlePlay}
          disabled={!onPlay && playlist.songs.length === 0}
          title={onPlay ? "Reproducir canción aleatoria" : "Reproducir playlist"}
        >
          <Play size={24} />
        </button>
      </div>
      <div className="playlist-info">
        <h3 className="playlist-name">{playlist.name}</h3>
        <p className="playlist-description">{playlist.description}</p>
      </div>
    </div>
  );
};