import React, { useState } from 'react';

export default function ReferralWidget({ userPlan }) {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://kapora.online/invite/ref-7x9a2k"; // Mock link

  // Only show aggressively if they are on free/trial, but can show for all.
  // The user requested for "ücretsiz deneme başlatan her kullanıcıya".
  // We can show it if currentPlan is 'free'.
  if (userPlan !== 'free') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#FDE047]/20 to-[#FDE047]/5 border border-[#FDE047]/30 rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-lg mb-6 mt-6">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FDE047]/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 relative z-10 w-full min-w-0">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto min-w-0">
          <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 bg-[#FDE047]/20 text-[#EAB308] rounded-full flex items-center justify-center border border-[#FDE047]/40 shadow-inner">
            <span className="material-symbols-outlined text-xl md:text-3xl">celebration</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display-sm text-base md:text-xl font-bold text-on-surface mb-1 truncate">Pro Üyeliğinizi 1 Ay Uzatın!</h3>
            <p className="text-on-surface-variant text-[11px] md:text-sm max-w-lg leading-snug">
              Bir meslektaşınızı davet edin, o kayıt olduğunda sizin <strong>Free</strong> süreniz 1 ay <strong>Pro</strong> olsun.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-surface-container-highest p-2 rounded-xl border border-outline w-full lg:w-auto shrink-0 max-w-full">
          <code className="text-primary font-mono text-xs md:text-sm px-2 py-1 select-all overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-[200px] flex-1 min-w-0">
            {referralLink}
          </code>
          <button 
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#1e1b4b] font-bold py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-colors whitespace-nowrap shrink-0 text-sm md:text-base"
          >
            <span className="material-symbols-outlined text-[16px] md:text-[18px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
        </div>
      </div>
    </div>
  );
}
