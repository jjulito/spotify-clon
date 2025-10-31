import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Playlist, Artist, LibraryState, Song } from '../types';

// Función para generar gradientes para decorar playlists
const generateGradient = (): string => {
  const gradients = [
    'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
    'linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%)',
    'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    'linear-gradient(135deg, #252525 0%, #353535 100%)',
    'linear-gradient(135deg, #222222 0%, #333333 100%)',
    'linear-gradient(135deg, #282828 0%, #383838 100%)',
    'linear-gradient(135deg, #1f1f1f 0%, #2f2f2f 100%)',
    'linear-gradient(135deg, #262626 0%, #363636 100%)'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

interface LibraryAction {
  type: string;
  payload?: any;
}

interface LibraryContextType {
  state: LibraryState;
  dispatch: React.Dispatch<LibraryAction>;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (playlistId: string) => void;
  addArtist: (artist: Artist) => void;
  removeArtist: (artistId: string) => void;
  createPlaylist: (name: string, description?: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

const libraryReducer = (state: LibraryState, action: LibraryAction): LibraryState => {
  switch (action.type) {
    case 'ADD_PLAYLIST':
      return {
        ...state,
        playlists: [...state.playlists, action.payload]
      };
    case 'REMOVE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.filter((p: Playlist) => p.id !== action.payload)
      };
    case 'ADD_ARTIST':
      return {
        ...state,
        artists: [...state.artists, action.payload]
      };
    case 'REMOVE_ARTIST':
      return {
        ...state,
        artists: state.artists.filter((a: Artist) => a.id !== action.payload)
      };
    case 'SET_PLAYLISTS':
      return {
        ...state,
        playlists: action.payload
      };
    case 'SET_ARTISTS':
      return {
        ...state,
        artists: action.payload
      };
    case 'ADD_SONG_TO_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map((playlist: Playlist) => 
          playlist.id === action.payload.playlistId 
            ? { ...playlist, songs: [...playlist.songs, action.payload.song] }
            : playlist
        )
      };
    case 'REMOVE_SONG_FROM_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map((playlist: Playlist) => 
          playlist.id === action.payload.playlistId 
            ? { ...playlist, songs: playlist.songs.filter((s: Song) => s.id !== action.payload.songId) }
            : playlist
        )
      };
    case 'UPDATE_PLAYLIST_COVER':
      return {
        ...state,
        playlists: state.playlists.map((playlist: Playlist) => 
          playlist.id === action.payload.playlistId 
            ? { ...playlist, coverUrl: action.payload.coverUrl }
            : playlist
        )
      };
    default:
      return state;
  }
};

const initialState: LibraryState = {
  playlists: [],
  artists: []
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const savedPlaylists = localStorage.getItem('userPlaylists');
    const savedArtists = localStorage.getItem('userArtists');
    
    if (savedPlaylists) {
      dispatch({ type: 'SET_PLAYLISTS', payload: JSON.parse(savedPlaylists) });
    }
    if (savedArtists) {
      dispatch({ type: 'SET_ARTISTS', payload: JSON.parse(savedArtists) });
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('userPlaylists', JSON.stringify(state.playlists));
  }, [state.playlists]);

  useEffect(() => {
    localStorage.setItem('userArtists', JSON.stringify(state.artists));
  }, [state.artists]);

  const addPlaylist = (playlist: Playlist) => {
    dispatch({ type: 'ADD_PLAYLIST', payload: playlist });
  };

  const removePlaylist = (playlistId: string) => {
    dispatch({ type: 'REMOVE_PLAYLIST', payload: playlistId });
  };

  const addArtist = (artist: Artist) => {
    dispatch({ type: 'ADD_ARTIST', payload: artist });
  };

  const removeArtist = (artistId: string) => {
    dispatch({ type: 'REMOVE_ARTIST', payload: artistId });
  };

  const createPlaylist = (name: string, description: string = '') => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      coverUrl: generateGradient(),
      songs: []
    };
    addPlaylist(newPlaylist);
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    dispatch({ 
      type: 'ADD_SONG_TO_PLAYLIST', 
      payload: { playlistId, song } 
    });
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    dispatch({ 
      type: 'REMOVE_SONG_FROM_PLAYLIST', 
      payload: { playlistId, songId } 
    });
  };

  const value: LibraryContextType = {
    state,
    dispatch,
    addPlaylist,
    removePlaylist,
    addArtist,
    removeArtist,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};