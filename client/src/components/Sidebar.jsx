import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Home, Users, Briefcase, BarChart2, Link as LinkIcon, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home size={16} /> },
    { to: '/leads', label: 'Leadler', icon: <Users size={16} /> },
    { to: '/properties', label: 'Portföy', icon: <Briefcase size={16} /> },
    { to: '/stats', label: 'İstatistikler', icon: <BarChart2 size={16} /> },
    { to: '/integrations', label: 'Entegrasyonlar', icon: <LinkIcon size={16} /> },
  ];

  return (
    <div className="w-[220px] bg-[#16181D] h-screen flex flex-col border-r border-[#2A2D35] flex-shrink-0">
      
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-4 mb-4">
        <div className="w-7 h-7 bg-[#2A2D35] rounded-md flex items-center justify-center mr-3">
          <span className="text-white font-bold text-[13px] tracking-wider">EA</span>
        </div>
        <span className="text-[#F1F2F4] font-medium text-[13px]">Emlak Asistanı</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                isActive 
                  ? 'bg-[#1E2028] text-[#F1F2F4] border-l-2 border-[#F5A623]' 
                  : 'text-[#7C8090] hover:bg-[#1E2028] hover:text-[#F1F2F4] border-l-2 border-transparent'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-[#2A2D35]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#2A2D35] flex items-center justify-center flex-shrink-0 text-[#F1F2F4] font-medium text-xs uppercase">
              {user?.name?.substring(0, 2) || 'EA'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[#F1F2F4] text-[13px] font-medium truncate">{user?.name || 'Kullanıcı'}</span>
              <span className="text-[10px] font-medium text-white bg-[#F5A623] px-1.5 py-0.5 rounded-sm uppercase self-start mt-0.5" style={{ letterSpacing: '0.05em' }}>
                {user?.plan === 'proplus' ? 'PRO+' : user?.plan?.toUpperCase() || 'FREE'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[#7C8090] hover:text-[#F1F2F4] transition-colors p-1"
            title="Çıkış Yap"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
