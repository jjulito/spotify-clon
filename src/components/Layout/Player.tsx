import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useState, useRef, useEffect } from 'react';

const Player = () => {
  const { state, dispatch, seek, playNext, playPrevious, toggleLike, likedSongs } = usePlayer();
  const [isMuted, setIsMuted] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Debug useEffect
  useEffect(() => {
    console.log('🔊 Estado del reproductor:', {
      currentSong: state.currentSong?.title,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      hasAudioUrl: !!state.currentSong?.audioUrl
    });
  }, [state.currentSong, state.isPlaying, state.currentTime]);

  const togglePlay = () => {
    if (!state.currentSong) return;
    dispatch({ type: 'TOGGLE_PLAY' });
  };

  const handleVolumeChange = (volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
    if (volume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      dispatch({ type: 'SET_VOLUME', payload: 50 });
      setIsMuted(false);
    } else {
      dispatch({ type: 'SET_VOLUME', payload: 0 });
      setIsMuted(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !state.duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * state.duration;
    
    seek(newTime);
  };

  const handleLike = () => {
    if (state.currentSong) {
      toggleLike(state.currentSong);
    }
  };

  const isCurrentSongLiked = state.currentSong 
    ? likedSongs.some(song => song.id === state.currentSong?.id)
    : false;

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeWheel = (e: React.WheelEvent) => {
  e.preventDefault();
  
  // Determinar la dirección de la rueda
  const delta = e.deltaY > 0 ? -5 : 5;
  
  // Calcular nuevo volumen
  let newVolume = state.volume + delta;
  
  // Asegurar que esté en el rango 0-100
  newVolume = Math.max(0, Math.min(100, newVolume));
  
  // Actualizar volumen
  handleVolumeChange(newVolume);
  
  // Si el volumen llega a 0, activar mute
  if (newVolume === 0) {
    setIsMuted(true);
  } else if (isMuted && newVolume > 0) {
    setIsMuted(false);
  }
};

  return (
    <div className="player">
      {/* Información de la canción */}
      <div className="song-info">
        {state.currentSong ? (
          <>
            <img src={state.currentSong.coverUrl} alt="Cover" />
            <div className="song-details">
              <div className="song-title">{state.currentSong.title}</div>
              <div className="song-artist">{state.currentSong.artist}</div>
            </div>
            <button 
              onClick={handleLike}
              className={`like-btn ${isCurrentSongLiked ? 'liked' : ''}`}
            >
              <Heart size={16} fill={isCurrentSongLiked ? '#1db954' : 'none'} />
            </button>
          </>
        ) : (
          <div className="no-song">
            <div className="song-title">Selecciona una canción</div>
            <div className="song-artist">Haz clic en reproducir</div>
          </div>
        )}
      </div>

      {/* Controles de reproducción */}
      <div className="player-center">
        <div className="player-controls">
          <button onClick={playPrevious} disabled={!state.currentSong}>
            <SkipBack size={20} />
          </button>
          <button 
            onClick={togglePlay} 
            disabled={!state.currentSong}
            className="play-pause-btn"
          >
            {state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={playNext} disabled={!state.currentSong}>
            <SkipForward size={20} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="progress-container">
          <span className="time-current">
            {formatTime(state.currentTime)}
          </span>
          <div 
            ref={progressBarRef}
            className="progress-bar"
            onClick={handleProgressClick}
          >
            <div 
              className="progress-fill"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
          <span className="time-total">
            {formatTime(state.duration)}
          </span>
        </div>
      </div>

      {/* Control de volumen */}
      <div className="volume-control">
        <button 
          onClick={toggleMute} 
          className="volume-btn"
          onWheel={handleVolumeWheel}
          title="Haz clic para silenciar o usa la rueda del mouse para ajustar volumen"
        >
          {isMuted || state.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <div 
          className="volume-slider-container"
          onWheel={handleVolumeWheel}
        >
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={state.volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default Player;