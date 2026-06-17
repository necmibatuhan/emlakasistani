import React from 'react';

export const LogoIcon = ({ className = "w-8 h-8", color = "currentColor" }) => (
  <img 
    src="/logo-k.png" 
    alt="Kapora Logo" 
    className={`${className} rounded-lg object-contain bg-white shadow-sm`} 
  />
);

export const Logo = ({ className = "", iconSize = "w-8 h-8", textSize = "text-[20px]" }) => {
  return (
    <a href="/" className={`flex items-center space-x-2 cursor-pointer ${className}`}>
      <LogoIcon className={iconSize} />
      <span className={`text-on-surface font-headline-md font-semibold tracking-tight ${textSize}`}>Kapora</span>
    </a>
  );
};
