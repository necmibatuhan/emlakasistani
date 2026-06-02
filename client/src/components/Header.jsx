import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, Home, PieChart, Star } from 'lucide-react';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-primary-dark text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-accent-gold font-bold">EA</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Emlak Asistanı</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/dashboard" className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition ${isActive('/dashboard') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
              <Home size={16} />
              <span>Dashboard</span>
            </Link>
            {user?.plan === 'proplus' && (
              <Link to="/stats" className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition ${isActive('/stats') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                <PieChart size={16} />
                <span>İstatistikler</span>
              </Link>
            )}
            <Link to="/plans" className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition ${isActive('/plans') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
              <Star size={16} className={user?.plan === 'proplus' ? 'text-accent-gold' : ''} />
              <span>Planlar {user?.plan === 'proplus' ? '(Pro+)' : ''}</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/profile" className="hidden md:block text-sm text-gray-300 hover:text-white transition">
            Merhaba, <span className="text-white font-medium">{user?.name}</span>
          </Link>
          <button onClick={handleLogout} className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition" title="Çıkış Yap">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
