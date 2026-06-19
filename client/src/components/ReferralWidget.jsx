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
    <div className="bg-gradient-to-r from-[#FDE047]/20 to-[#FDE047]/5 border border-[#FDE047]/30 rounded-2xl p-6 relative overflow-hidden shadow-lg mb-6 mt-6">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FDE047]/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 bg-[#FDE047]/20 text-[#EAB308] rounded-full flex items-center justify-center border border-[#FDE047]/40 shadow-inner">
            <span className="material-symbols-outlined text-3xl">celebration</span>
          </div>
          <div>
            <h3 className="font-display-sm text-xl font-bold text-on-surface mb-1">Pro Üyeliğinizi 1 Ay Uzatın!</h3>
            <p className="text-on-surface-variant text-sm max-w-md">
              Memnun kaldınız mı? Bir meslektaşınızı davet edin, o kayıt olduğunda sizin <strong>Ücretsiz Deneme (Free)</strong> süreniz tam 1 ay boyunca <strong>Pro</strong> olsun. Sınır yok, ne kadar arkadaş o kadar Pro!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-highest p-2 rounded-xl border border-outline w-full md:w-auto">
          <code className="text-primary font-mono text-sm px-3 select-all">{referralLink}</code>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#1e1b4b] font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>
      </div>
    </div>
  );
}
