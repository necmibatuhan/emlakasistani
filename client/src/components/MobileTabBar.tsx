import React from 'react';
import { NavLink } from 'react-router-dom';

const MobileTabBar = () => {
  const tabs = [
    { to: '/dashboard', label: 'Ana Sayfa', icon: 'dashboard' },
    { to: '/leads', label: 'Müşteriler', icon: 'group' },
    { to: '/properties', label: 'Portföy', icon: 'home_work' },
    { to: '/profile', label: 'Profil', icon: 'account_circle' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[56px] pb-safe bg-[#1C1E24] border-t border-[#2A2D35] z-50 flex items-center justify-around lg:hidden">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] transition-colors ${
              isActive ? 'text-[#10B981]' : 'text-[#8E929C] hover:text-[#F1F2F4]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span 
                className="material-symbols-outlined text-[24px]" 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}} />
    </nav>
  );
};

export default MobileTabBar;
