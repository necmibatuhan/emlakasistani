import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UIContext } from '../contexts/UIContext';
import { Logo } from './Logo';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Header = () => {
  const { user, token } = useContext(AuthContext);
  const { toggleSidebar } = useContext(UIContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!token,
    staleTime: 30000
  });

  // Reminders: Leads that are very_urgent or urgent, or labeled as 'Sıcak'
  const reminders = leads.filter(l => l.label === 'Sıcak' || l.urgency === 'very_urgent' || l.urgency === 'urgent').slice(0, 5);

  const handleNewClick = () => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      setTimeout(() => {
        window.dispatchEvent(new Event('open-new-lead-drawer'));
      }, 100);
    } else {
      window.dispatchEvent(new Event('open-new-lead-drawer'));
    }
  };

  return (
    <header className="bg-background dark:bg-background border-b border-outline-variant flex justify-between items-center h-16 px-4 md:px-container-padding sticky top-0 z-30">
      {/* Left: Search/Title */}
      <div className="flex items-center gap-2 md:gap-stack-lg flex-1">
        {/* Logo (Mobile Only) */}
        <div className="lg:hidden flex items-center mr-2">
          <Logo iconSize="w-7 h-7" textSize="text-[20px]" />
        </div>
        
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
          <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-all duration-200 ease-in-out font-label-caps text-label-caps uppercase tracking-wider">
            Leadler
          </Link>
          <Link to="/properties" className="text-on-surface-variant hover:text-primary transition-all duration-200 ease-in-out font-label-caps text-label-caps uppercase tracking-wider">
            Portföy
          </Link>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-stack-md relative">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-background"></span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-[300px] bg-panel border custom-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in-up">
              <div className="p-3 border-b custom-border bg-surface-container-lowest">
                <h3 className="font-headline-sm text-on-surface">Hatırlatmalar</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
                {reminders.length > 0 ? reminders.map(r => (
                  <Link key={r.id} to={`/dashboard?lead=${r.id}`} onClick={() => setShowNotifications(false)} className="flex flex-col p-2 hover:bg-surface-container rounded-md transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-body-md text-on-surface font-medium">{r.properties?.name || 'İsimsiz Lead'}</span>
                      <span className="font-label-sm text-error bg-error/10 px-1.5 py-0.5 rounded">{r.urgency === 'very_urgent' ? 'Çok Acil' : 'Sıcak'}</span>
                    </div>
                    <span className="font-body-sm text-on-surface-variant line-clamp-1">{r.properties?.note || 'Not bulunmuyor'}</span>
                  </Link>
                )) : (
                  <div className="p-4 text-center font-body-sm text-on-surface-variant">Yeni hatırlatma yok.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <a href="mailto:support@emlakasistani.com" className="text-on-surface-variant hover:text-on-surface transition-colors hidden sm:flex items-center justify-center">
          <span className="material-symbols-outlined">help</span>
        </a>
        <button onClick={handleNewClick} className="bg-primary-container text-[#000] font-label-caps text-[11px] md:text-label-caps px-3 md:px-4 py-2 rounded-md hover:brightness-110 transition-all font-bold min-h-[44px]">
          Yeni
        </button>
        <Link to="/profile" className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant overflow-hidden ml-1 md:ml-2 flex items-center justify-center hover:opacity-80 transition-opacity">
          {user?.avatarUrl ? (
            <img alt="Avatar" className="w-full h-full object-cover" src={user.avatarUrl} />
          ) : (
             <span className="text-on-surface-variant font-medium text-sm">{user?.name?.substring(0, 2).toUpperCase() || 'EA'}</span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
