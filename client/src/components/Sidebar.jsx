import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/leads', label: 'Leadler', icon: 'group' },
    { to: '/properties', label: 'Portföy', icon: 'home_work' },
    { to: '/stats', label: 'İstatistikler', icon: 'analytics' },
    { to: '/integrations', label: 'Entegrasyonlar', icon: 'sync' },
  ];

  return (
    <nav className="bg-surface-container dark:bg-surface-container fixed left-0 top-0 h-full w-[240px] border-r border-outline-variant flex flex-col p-stack-md z-20">
      {/* Header */}
      <div className="flex items-center gap-stack-sm mb-stack-lg p-stack-sm">
        <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center font-bold text-on-primary-container" title="EA Monogram">
          EA
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary">Takip.ai</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Emlak Yönetimi</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <ul className="flex-1 flex flex-col gap-unit">
        {navItems.map((item) => (
          <li key={item.to} className="group">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-stack-sm p-stack-sm cursor-pointer active:scale-95 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary bg-secondary-container font-bold' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer Navigation Tabs */}
      <ul className="mt-auto border-t border-outline-variant pt-stack-sm flex flex-col gap-unit">
        <li className="group">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-stack-sm p-stack-sm cursor-pointer active:scale-95 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'text-primary bg-secondary-container font-bold' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`
            }
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span>Profilim</span>
          </NavLink>
        </li>
        <li className="group">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-stack-sm p-stack-sm cursor-pointer active:scale-95 text-on-surface-variant hover:text-error hover:bg-surface-container-high transition-colors duration-200 rounded-lg"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Çıkış Yap</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
