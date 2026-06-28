import React, { createContext, useState } from 'react';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <UIContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </UIContext.Provider>
  );
};
