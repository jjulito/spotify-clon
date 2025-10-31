export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songs: Song[];
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  followers: number;
}

export interface PlayerState {
  currentSong: Song | null;
  currentPlaylist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  currentTime: number;
  duration: number;
}

export type LibraryItem = Playlist | Artist;

export interface LibraryState {
  playlists: Playlist[];
  artists: Artist[];
}