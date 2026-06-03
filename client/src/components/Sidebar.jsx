import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UIContext } from '../contexts/UIContext';
import { Logo } from './Logo';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isSidebarOpen, closeSidebar } = useContext(UIContext);
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
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <nav className={`bg-surface-container dark:bg-surface-container fixed left-0 top-0 h-full w-[240px] border-r border-outline-variant flex flex-col p-stack-md z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Header */}
      <div className="flex items-center mb-stack-lg p-stack-sm">
        <Logo iconSize="w-8 h-8" textSize="text-[22px]" />
      </div>

      {/* Main Navigation Tabs */}
      <ul className="flex-1 flex flex-col gap-unit">
        {navItems.map((item) => (
          <li key={item.to} className="group">
            <NavLink
              to={item.to}
              onClick={() => closeSidebar()}
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
            onClick={() => closeSidebar()}
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
    </>
  );
};

export default Sidebar;
