import { Playlist, Song } from '../types';

export const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    audioUrl: '/audio/sample1.mp3'
  },
  {
    id: '2',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 215,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    audioUrl: '/audio/sample2.mp3'
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
    audioUrl: '/audio/sample3.mp3'
  }
];

export const mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: 'Éxitos de Hoy',
    description: 'Los hits más populares del momento',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    songs: mockSongs
  },
  {
    id: '2',
    name: 'Vibes Relajantes',
    description: 'Relájate con estos temas suaves',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    songs: mockSongs.slice(0, 2)
  },
  {
    id: '3',
    name: 'Mix para Ejercicio',
    description: 'Energía para tu sesión de entrenamiento',
    coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    songs: mockSongs.slice(1)
  },
  {
    id: '4',
    name: 'Clásicos',
    description: 'Canciones clásicas que conoces y amas',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop',
    songs: mockSongs
  }
];