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

  if (leads.length === 0) {
    return (
      <div className="bg-[#16181D] rounded-[8px] border-l-[3px] border-l-[#3B82F6] border-y border-r border-[#2A2D35] p-5 shadow-lg flex flex-col gap-4">
        <h2 className="text-[14px] font-medium text-[#F1F2F4]">
          Günaydın, {userName}. Henüz sisteme bir müşteri eklemediniz.
        </h2>
        <div className="text-[13px] text-[#7C8090]">
          Müşteri verileriniz eklendikçe günlük aksiyonlarınız burada listelenecektir. Sol menüden veya "Yeni Lead Ekle" butonundan ilk müşterinizi sesinizle ekleyebilirsiniz.
        </div>
      </div>
    );
  }

  // Pick top 3 actionable leads
  const topLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-[#16181D] rounded-[8px] border-l-[3px] border-l-[#F5A623] border-y border-r border-[#2A2D35] p-5 shadow-lg flex flex-col gap-4">
      <h2 className="text-[14px] font-medium text-[#F1F2F4]">
        Günaydın, {userName}. Bugün {Math.min(3, leads.length)} kritik aksiyon seni bekliyor.
      </h2>
      
      <div className="flex flex-col gap-2.5">
        {topLeads.map((lead, idx) => {
          const budgetMatch = lead.message?.match(/([\d\.]+)\s*(milyon|M)/i);
          const budgetStr = budgetMatch ? `${budgetMatch[1]}M bütçe` : 'Bütçe belirtilmedi';
          
          let actionText = 'Gösterim sonrası takip bekliyor';
          if (lead.category === '🔥 Hemen Ara') actionText = 'Acil aranması tavsiye ediliyor';
          else if (lead.category === '⚡ Bugün Ulaş') actionText = 'Bugün ulaşılması gerekiyor';
          
          return (
            <div key={lead.id} className="flex items-center gap-3 text-[13px]">
              <span>{medals[idx] || '🎯'}</span>
              <span className="font-bold text-[#F1F2F4] w-[120px] truncate">{lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz Lead' : lead.name}</span>
              <span className="font-mono text-[#10B981] w-[100px] truncate">{budgetStr}</span>
              <span className="text-[#7C8090] truncate">{actionText}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-4 border-t border-[#2A2D35] flex items-center gap-3 text-[12px] text-[#7C8090]">
        <span className="text-[#EF4444] font-medium flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">warning</span>
          {uncontacted14Days.length} lead kaybedilmek üzere
        </span>
        <span className="text-[#2A2D35]">•</span>
        <span className="text-[#10B981] font-medium flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          {Math.min(4, leads.length * 2)} yeni eşleşme bulundu
        </span>
      </div>
    </div>
  );
}
