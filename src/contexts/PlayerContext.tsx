import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import { Song, PlayerState } from '../types';

interface PlayerAction {
  type: string;
  payload?: any;
}

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  seek: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleLike: (song: Song) => void;
  likedSongs: Song[];
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'PLAY_SONG':
      return { 
        ...state, 
        currentSong: action.payload.song,
        currentPlaylist: action.payload.playlist,
        currentIndex: action.payload.index,
        isPlaying: true,
        currentTime: 0,
        progress: 0
      };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_PLAYLIST':
      return { ...state, currentPlaylist: action.payload };
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    default:
      return state;
  }
};

const initialState: PlayerState = {
  currentSong: null,
  currentPlaylist: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 50,
  progress: 0,
  currentTime: 0,
  duration: 0
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const [likedSongs, setLikedSongs] = React.useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar liked songs desde localStorage al iniciar
  React.useEffect(() => {
    const savedLikes = localStorage.getItem('likedSongs');
    if (savedLikes) {
      setLikedSongs(JSON.parse(savedLikes));
    }
  }, []);

  // Guardar liked songs en localStorage cuando cambien
  React.useEffect(() => {
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  // Inicializar el elemento de audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          const duration = audioRef.current.duration || 0;
          const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
          
          dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
          dispatch({ type: 'SET_PROGRESS', payload: progress });
          dispatch({ type: 'SET_DURATION', payload: duration });
        }
      });

      audioRef.current.addEventListener('ended', () => {
        playNext();
      });
    }
  }, []);

  // Efecto para controlar reproducción/pausa
  useEffect(() => {
    if (audioRef.current && state.currentSong) {
      if (state.isPlaying) {
        audioRef.current.src = state.currentSong.audioUrl;
        audioRef.current.currentTime = state.currentTime; // Mantener posición
        audioRef.current.volume = state.volume / 100;
        
        audioRef.current.play().catch(error => {
          console.error('Error reproduciendo audio:', error);
          dispatch({ type: 'TOGGLE_PLAY' });
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [state.isPlaying, state.currentSong]);

  // Efecto para controlar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume / 100;
    }
  }, [state.volume]);

  // Función para buscar en el audio
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    }
  };

  // Función para reproducir siguiente canción
  const playNext = () => {
    if (state.currentPlaylist && state.currentPlaylist.length > 0) {
      const nextIndex = (state.currentIndex + 1) % state.currentPlaylist.length;
      const nextSong = state.currentPlaylist[nextIndex];
      
      dispatch({ 
        type: 'PLAY_SONG', 
        payload: {
          song: nextSong,
          playlist: state.currentPlaylist,
          index: nextIndex
        }
      });
    }
  };

  // Función para reproducir canción anterior
  const playPrevious = () => {
    if (state.currentPlaylist && state.currentPlaylist.length > 0) {
      const prevIndex = state.currentIndex <= 0 
        ? state.currentPlaylist.length - 1 
        : state.currentIndex - 1;
      const prevSong = state.currentPlaylist[prevIndex];
      
      dispatch({ 
        type: 'PLAY_SONG', 
        payload: {
          song: prevSong,
          playlist: state.currentPlaylist,
          index: prevIndex
        }
      });
    }
  };

  // Función para togglear like
  const toggleLike = (song: Song) => {
    setLikedSongs(prev => {
      const isLiked = prev.some(s => s.id === song.id);
      if (isLiked) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  };

  const value: PlayerContextType = {
    state,
    dispatch,
    seek,
    playNext,
    playPrevious,
    toggleLike,
    likedSongs
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};