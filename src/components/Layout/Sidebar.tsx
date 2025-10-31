import { Home, Search, Library, Plus, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';


const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Search, label: 'Buscar', path: '/search' },
    { icon: Library, label: 'Tu Biblioteca', path: '/library' },
  ];

  return (
    <div className="sidebar">
      <div className="logo">Clon de Spotify</div>
      
      <nav className="navigation">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={24} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

     <div className="playlist-header" onClick={() => navigate('/library')}>
        <Plus size={20} />
        <span>Crear playlist</span>
        </div>
        <Link 
          to="/liked-songs" 
          className={`playlist-item ${location.pathname === '/liked-songs' ? 'active' : ''}`}
        >
          <Heart size={20} />
          <span>Tus Me Gusta</span>
        </Link>
      </div>
  );
};

export default Sidebar;