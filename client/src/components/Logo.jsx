import React from 'react';

export const LogoIcon = ({ className = "w-8 h-8", color = "currentColor" }) => (
  <svg className={`${className} text-primary`} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="6" height="24" fill="currentColor" />
    <path d="M 28 4 L 14 16 L 28 28 L 22 28 L 8 16 L 22 4 Z" fill="currentColor" />
  </svg>
);

export const Logo = ({ className = "", iconSize = "w-8 h-8", textSize = "text-[20px]" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LogoIcon className={iconSize} />
      <span className={`text-on-surface font-headline-md font-semibold tracking-tight ${textSize}`}>Kapora</span>
    </div>
  );
};
