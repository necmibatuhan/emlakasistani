import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import WhatsAppButton from './WhatsAppButton';

const PrioritiesWidget = () => {
  const { token } = useContext(AuthContext);

  const { data: priorities = [], isLoading } = useQuery({
    queryKey: ['dashboard_priorities'],
    queryFn: async () => {
      const res = await axios.get(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/dashboard/priorities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    refetchInterval: 60000,
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[#10B981]'; // Green
    if (score >= 60) return 'text-[#F5A623]'; // Yellow
    return 'text-[#7C8090]'; // Gray
  };

  const formatPhoneForWa = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('90')) {
      cleaned = '90' + cleaned;
    }
    return cleaned;
  };

  if (isLoading) {
    return null;
  }

  if (priorities.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
          <h2 className="text-xl font-bold text-[#F1F2F4]">Günün Öncelikleri</h2>
          <p className="text-[13px] text-[#7C8090] mt-1">Bugün iletişime geçmen gereken {priorities.length} müşteri</p>
        </div>
        <div className="text-[11px] text-[#7C8090] hidden sm:block">AI tarafından güncellendi · az önce</div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
        {priorities.map((lead, index) => (
          <div 
            key={lead.id} 
            className="snap-start min-w-[280px] sm:min-w-[320px] bg-[#1C1E24] border border-[#2A2D35] rounded-xl p-5 flex flex-col justify-between flex-shrink-0 relative overflow-hidden"
          >
            {/* Sıralama rozeti */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#F5A623]/20 to-transparent rounded-full flex items-center justify-center">
               <span className="text-[#F5A623] font-bold text-lg mr-2 mt-2">#{index + 1}</span>
            </div>

            <div>
              <div className="flex justify-between items-start mb-3 pr-10">
                <div className="font-bold text-[#F1F2F4] text-[15px] truncate">{lead.name || 'İsimsiz Müşteri'}</div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#F5A623]/20 bg-[#F5A623]/5 p-2.5">
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-[#8E929C]">Bugünkü öncelik</span>
                  <strong className={`mt-1 block text-xl ${getScoreColor(lead.priority_score)}`}>{lead.priority_score || 0}<span className="ml-0.5 text-[10px] font-normal text-[#7C8090]">/100</span></strong>
                </div>
                <div className="rounded-lg border border-violet-400/20 bg-violet-400/[0.06] p-2.5">
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-[#8E929C]">Dönüşüm olasılığı</span>
                  {lead.predicted_conversion_score !== null ? <strong className={`mt-1 block text-xl ${getScoreColor(lead.predicted_conversion_score)}`}>%{lead.predicted_conversion_score}</strong> : <span className="mt-1 block text-[11px] font-medium leading-5 text-[#A7AAB4]">{lead.predictive_score_status === 'insufficient_data' ? 'Yetersiz veri' : 'Hesaplanıyor'}</span>}
                </div>
              </div>

              {lead.score_conflict ? <div className="mb-3 flex items-start gap-1.5 rounded-md border border-amber-400/25 bg-amber-400/10 p-2 text-[11px] leading-4 text-amber-200"><span className="material-symbols-outlined text-[14px]">warning</span><span>{lead.score_conflict === 'high_priority_low_conversion' ? 'Yüksek öncelik, düşük dönüşüm olasılığı: ilişkiyi yeniden canlandırmak için bugün temas kur.' : 'Düşük günlük öncelik, yüksek dönüşüm olasılığı: fırsatı gözden kaçırma.'}</span></div> : null}
              
              <div className="text-[12px] text-[#7C8090] min-h-[36px] line-clamp-2 leading-snug">
                {lead.score_reasons?.length ? lead.score_reasons.join(' · ') : (lead.reasoning || lead.message || 'Takip önerisi')}
              </div>
              
              <div className="text-[11px] text-[#8E929C] mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">history</span>
                Son görüşme: {lead.last_contact_days === 0 ? 'Bugün' : `${lead.last_contact_days} gün önce`}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#2A2D35]">
              <div className="flex-1">
                <WhatsAppButton customer={lead} className="w-full h-full py-2" />
              </div>
              
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-new-lead-drawer', { detail: { leadId: lead.id }}));
                }}
                className="flex-1 bg-transparent hover:bg-[#2A2D35] text-[#F1F2F4] border border-[#2A2D35] rounded-lg py-2 flex items-center justify-center text-[13px] font-medium transition-colors"
              >
                Notları Gör
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-right mt-1 px-1">
        <Link to="/leads" className="text-[13px] text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors">
          Tüm müşterileri gör &rarr;
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default PrioritiesWidget;
