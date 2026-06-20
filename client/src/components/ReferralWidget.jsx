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
    <div className="bg-[#1e1b4b] border border-[#FDE047]/30 rounded-xl p-4 md:p-5 relative overflow-hidden shadow-lg mb-6">
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#FDE047]/10 rounded-full blur-2xl opacity-50 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-4 w-full lg:w-auto min-w-0">
          <div className="w-12 h-12 shrink-0 bg-[#FDE047]/10 text-[#FDE047] rounded-full flex items-center justify-center border border-[#FDE047]/20">
            <span className="material-symbols-outlined text-2xl">celebration</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-white mb-0.5 truncate pr-2">Pro Üyeliğinizi 1 Ay Uzatın!</h3>
            <p className="text-white/70 text-xs md:text-sm break-words">
              Memnun kaldınız mı? Bir arkadaşınızı davet edin, 1 ay Pro kazanın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-white/10 w-full md:w-auto shrink-0 max-w-full overflow-hidden">
          <code className="text-[#FDE047] font-mono text-xs px-2 truncate flex-1 min-w-0">
            {referralLink}
          </code>
          <button 
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 bg-[#FDE047] hover:bg-[#FDE047]/90 text-black font-bold py-1.5 px-3 rounded-md transition-colors shrink-0 text-sm"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
        </div>
      </div>
    </div>
  );
}
