import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import WhatsAppButton from './WhatsAppButton';

const PrioritiesWidget = () => {
  const { token, user } = useContext(AuthContext);

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

  const handleWaClick = (lead) => {
    // Moved to WhatsAppButton
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
              <div className="flex justify-between items-start mb-2 pr-10">
                <div className="font-bold text-[#F1F2F4] text-[15px] truncate">{lead.name || 'İsimsiz Müşteri'}</div>
                <div className={`font-bold text-2xl ${getScoreColor(lead.score)} leading-none flex items-center gap-1.5`}>
                  <span className="text-[10px] text-[#7C8090] font-normal tracking-wider mt-1">SKOR</span>
                  {lead.score || 0}
                </div>
              </div>
              
              <div className="text-[12px] text-[#7C8090] min-h-[36px] line-clamp-2 leading-snug">
                {lead.reasoning || (typeof lead.properties === 'string' ? JSON.parse(lead.properties)?.ai_insight : lead.properties?.ai_insight) || lead.message || (lead.score_reasons && lead.score_reasons.length > 0 ? lead.score_reasons.join(' · ') : 'Yapay zeka önerisi')}
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
