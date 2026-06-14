import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function MorningSummary({ leads = [] }) {
  const { user } = useContext(AuthContext);
  
  // Calculate specific metrics
  const uncontacted14Days = leads.filter(l => {
    if (!l.updated_at) return false;
    const diffTime = Math.abs(new Date() - new Date(l.updated_at));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 14 && l.score >= 7;
  });

  const userName = user?.name?.split(' ')[0] || 'Ahmet'; // Fallback to Ahmet if not found

  return (
    <div className="bg-[#16181D] rounded-[8px] border-l-[3px] border-l-[#F5A623] border-y border-r border-[#2A2D35] p-5 shadow-lg flex flex-col gap-4">
      <h2 className="text-[14px] font-medium text-[#F1F2F4]">
        Günaydın, {userName}. Bugün 3 kritik aksiyon seni bekliyor.
      </h2>
      
      <div className="flex flex-col gap-2.5">
        {/* Mock/Dynamic rows based on instructions */}
        <div className="flex items-center gap-3 text-[13px]">
          <span>🥇</span>
          <span className="font-bold text-[#F1F2F4] w-[120px]">Orhan Bey</span>
          <span className="font-mono text-[#10B981] w-[100px]">7.5M bütçe</span>
          <span className="text-[#7C8090]">17 gündür aranmadı</span>
        </div>
        
        <div className="flex items-center gap-3 text-[13px]">
          <span>🥈</span>
          <span className="font-bold text-[#F1F2F4] w-[120px]">Ahmet & Selin</span>
          <span className="text-[#F5A623] w-[180px]">Portföy eşleşmesi bulundu</span>
          <span className="font-mono text-[#F1F2F4]">4 ilan</span>
        </div>
        
        <div className="flex items-center gap-3 text-[13px]">
          <span>🥉</span>
          <span className="font-bold text-[#F1F2F4] w-[120px]">Cemre Polat</span>
          <span className="text-[#7C8090]">Gösterim sonrası takip bekliyor</span>
        </div>
      </div>

      <div className="mt-2 pt-4 border-t border-[#2A2D35] flex items-center gap-3 text-[12px] text-[#7C8090]">
        <span className="text-[#EF4444] font-medium flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">warning</span>
          {uncontacted14Days.length > 0 ? uncontacted14Days.length : 2} lead kaybedilmek üzere
        </span>
        <span className="text-[#2A2D35]">•</span>
        <span className="text-[#10B981] font-medium flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          4 yeni eşleşme bulundu
        </span>
      </div>
    </div>
  );
}
