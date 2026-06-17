import React from 'react';

export const LogoIcon = ({ className = "w-8 h-8" }) => (
  <div className={`relative flex items-center justify-center rounded-[10px] bg-gradient-to-b from-white to-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/10 overflow-hidden ${className}`}>
    <img 
      src="/logo-k.png" 
      alt="Kapora Logo" 
      className="w-[80%] h-[80%] object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110" 
    />
  </div>
);

export const Logo = ({ className = "", iconSize = "w-9 h-9", textSize = "text-[22px]" }) => {
  return (
    <a href="/" className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <LogoIcon className={`${iconSize} transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(253,224,71,0.2)]`} />
      <span className={`font-display-md font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 ${textSize}`}>
        Kapora
      </span>
    </a>
  );
};
