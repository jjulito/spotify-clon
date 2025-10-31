import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, Search, Library, Playlist } from './pages';
import { Sidebar, Player } from './components/Layout';
import LikedSongs from './pages/LikedSongs';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/liked-songs" element={<LikedSongs />} />
          </Routes>
        </main>
        <Player />
      </div>
    </Router>
  );
}
export default App;