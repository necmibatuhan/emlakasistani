import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UIContext } from '../contexts/UIContext';

const Header = () => {
  const { user } = useContext(AuthContext);
  const { toggleSidebar } = useContext(UIContext);

  return (
    <header className="bg-background dark:bg-background border-b border-outline-variant flex justify-between items-center h-16 px-4 md:px-container-padding sticky top-0 z-30">
      {/* Left: Search/Title */}
      <div className="flex items-center gap-2 md:gap-stack-lg flex-1">
        {/* Hamburger Menu (Mobile Only) */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-on-surface-variant hover:text-on-surface p-1 mr-2"
        >
          <span className="material-symbols-outlined text-[28px]">menu</span>
        </button>
        
        <div className="relative w-full max-w-[200px] md:max-w-xs hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input 
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md pl-9 pr-3 py-1.5 font-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" 
            placeholder="Ara..." 
            type="text"
          />
        </div>
        {/* Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-stack-md">
          <Link to="/leads" className="text-on-surface-variant hover:text-primary transition-all duration-200 ease-in-out font-label-caps text-label-caps uppercase tracking-wider">
            Leadler
          </Link>
          <Link to="/properties" className="text-on-surface-variant hover:text-primary transition-all duration-200 ease-in-out font-label-caps text-label-caps uppercase tracking-wider">
            Portföy
          </Link>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-stack-md">
        <button className="text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button className="bg-primary-container text-[#000] font-label-caps text-[11px] md:text-label-caps px-3 md:px-4 py-2 rounded-md hover:brightness-110 transition-all font-bold min-h-[44px]">
          Yeni
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant overflow-hidden ml-1 md:ml-2 flex items-center justify-center">
          {user?.avatarUrl ? (
            <img alt="Avatar" className="w-full h-full object-cover" src={user.avatarUrl} />
          ) : (
             <span className="text-on-surface-variant font-medium text-sm">{user?.name?.substring(0, 2).toUpperCase() || 'EA'}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
