import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { ArrowRight, Home, Loader2, Phone, Sparkles } from 'lucide-react';

export default function MorningSummary() {
  const { user, token } = useContext(AuthContext);

  const { data: briefing, isLoading, isError } = useQuery({
    queryKey: ['morningBriefing'],
    queryFn: async () => {
      const res = await axios.get(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/dashboard/briefing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000 // 5 dakika cache'li kalsın
  });

  const userName = user?.name?.split(' ')[0] || 'Danışman';

  if (isLoading) {
    return (
      <div className="bg-[#16181D] rounded-[8px] border-l-[3px] border-l-[#F5A623] border-y border-r border-[#2A2D35] p-5 shadow-lg flex items-center justify-center gap-2 h-[200px]">
        <Loader2 className="animate-spin text-[#F5A623]" size={20} />
        <span className="text-[#7C8090] text-sm">Güne Başlarken özetiniz hazırlanıyor...</span>
      </div>
    );
  }

  if (isError || !briefing) {
    return (
      <div className="bg-[#16181D] rounded-[8px] border-l-[3px] border-l-[#EF4444] border-y border-r border-[#2A2D35] p-5 shadow-lg">
        <span className="text-[#7C8090] text-sm">Özet bilgisi şu an alınamıyor.</span>
      </div>
    );
  }

  return (
    <div className="bg-[#16181D] rounded-[8px] border-l-[3px] border-l-[#F5A623] border-y border-r border-[#2A2D35] p-5 shadow-lg flex flex-col gap-5">
      
      {/* Header & Motivation */}
      <div>
        <h2 className="text-[16px] font-bold text-[#F1F2F4] flex items-center gap-2 mb-2">
          🌅 Günaydın, {userName}!
        </h2>
        <div className="bg-[#0A0B0D] border border-[#2A2D35] rounded-md p-3 flex gap-3 items-start">
          <Sparkles className="text-[#F5A623] shrink-0 mt-0.5" size={16} />
          <p className="text-[13px] text-[#A0A5B5] italic leading-relaxed">
            "{briefing.motivation}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hot Leads Section */}
        <div>
          <h3 className="text-[13px] font-bold text-[#F1F2F4] uppercase tracking-wider mb-3 flex items-center gap-2">
            🔥 En Sıcak 3 Müşteri
          </h3>
          {briefing.hotLeads?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {briefing.hotLeads.map((lead, idx) => (
                <div key={lead.id} className="flex items-center justify-between bg-[#0A0B0D] border border-[#2A2D35] p-2.5 rounded-md">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-[13px] text-white truncate">{lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz Müşteri' : lead.name}</span>
                    <span className="text-[11px] text-[#10B981] font-medium mt-0.5">Skor: {lead.score}/10</span>
                  </div>
                  <a href={`tel:${lead.phone}`} className="shrink-0 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] px-3 py-1.5 rounded flex items-center gap-1.5 text-[12px] font-bold transition-colors">
                    <Phone size={12} /> Ara
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#7C8090]">Şu an acil aranması gereken sıcak müşteri bulunmuyor.</p>
          )}
        </div>

        {/* Dormant relationships */}
        <div>
          <h3 className="text-[13px] font-bold text-[#F1F2F4] uppercase tracking-wider mb-3 flex items-center gap-2">
            ⚠️ Soğumadan Geri Dön
          </h3>
          {briefing.dormantLeads?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {briefing.dormantLeads.map(lead => (
                <button type="button" key={lead.id} onClick={() => window.dispatchEvent(new CustomEvent('open-lead-detail', { detail: { leadId: lead.id } }))} className="flex w-full items-center justify-between bg-[#0A0B0D] border border-[#2A2D35] p-2.5 rounded-md text-left hover:border-[#F5A623]/40 transition-colors">
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="font-semibold text-[13px] text-white truncate">{lead.name}</span>
                    <span className="text-[11px] text-[#EF4444] mt-0.5">{lead.silent_days} gündür temas yok</span>
                  </div>
                  <ArrowRight size={15} className="shrink-0 text-[#F5A623]" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#7C8090]">Harika! Takipsiz kalan müşteriniz yok.</p>
          )}
        </div>

      </div>

      {briefing.newMatches?.length > 0 ? <div className="border-t border-[#2A2D35] pt-4">
        <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#F1F2F4]"><Home size={15} className="text-[#3B82F6]" /> Yeni Portföy Eşleşmeleri</h3>
        <div className="grid gap-2 md:grid-cols-3">{briefing.newMatches.map((match) => <button type="button" key={`${match.lead_id}-${match.property_id}`} onClick={() => window.dispatchEvent(new CustomEvent('open-lead-detail', { detail: { leadId: match.lead_id } }))} className="rounded-md border border-[#2A2D35] bg-[#0A0B0D] p-3 text-left hover:border-[#3B82F6]/50"><span className="block truncate text-xs font-semibold text-white">{match.lead_name} ↔ {match.property_title}</span><span className="mt-1 block text-[11px] text-[#3B82F6]">%{match.match_score} eşleşme · İncele</span></button>)}</div>
      </div> : null}
    </div>
  );
}
