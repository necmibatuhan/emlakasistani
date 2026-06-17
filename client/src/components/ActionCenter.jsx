import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionCenter({ leads = [], onActionClick }) {
  const [activeTab, setActiveTab] = useState('bugun'); // 'kaybedilecek', 'bugun', 'komisyon', 'uyuyan'

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return 0;
    const diffTime = Math.abs(new Date() - new Date(dateStr));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBudgetVal = (lead) => {
    let budget = 0;
    if (lead.properties) {
      try {
        const props = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
        budget = props?.budget?.max || props?.budget?.min || 0;
      } catch(e) {}
    }
    // Simple fallback string parser if properties isn't helping
    if (!budget && typeof lead.message === 'string') {
        const match = lead.message.match(/([\d\.]+)\s*(milyon|M)/i);
        if (match) {
            budget = parseFloat(match[1]) * 1000000;
        }
    }
    return budget || 5000000; // Mock fallback
  };

  // 1. Kaybedilecek Leadler (14+ gün temas yok VE skor 7+)
  const losingLeads = useMemo(() => {
    return leads.filter(l => getDaysAgo(l.updated_at) >= 14 && l.score >= 7)
                .sort((a, b) => b.score - a.score);
  }, [leads]);

  // 2. Bugün Aranacak (Hatırlatıcı bugün veya skor yüksek ve yeni)
  const todayLeads = useMemo(() => {
    return leads.filter(l => {
      const daysAgo = getDaysAgo(l.updated_at);
      return daysAgo < 14 && l.score >= 7; // simplified logic
    }).sort((a, b) => b.score - a.score);
  }, [leads]);

  // 3. Yüksek Komisyon
  const highCommLeads = useMemo(() => {
    return [...leads].sort((a, b) => getBudgetVal(b) - getBudgetVal(a)).slice(0, 5);
  }, [leads]);

  // 4. Uyuyan Leadler
  const sleepingLeads = useMemo(() => {
    return leads.filter(l => getDaysAgo(l.updated_at) >= 30)
                .sort((a, b) => getDaysAgo(b.updated_at) - getDaysAgo(a.updated_at));
  }, [leads]);

  const tabs = [
    { id: 'kaybedilecek', title: 'Kaybedilecek', icon: '🚨', count: losingLeads.length, color: '#EF4444' },
    { id: 'bugun', title: 'Bugün Aranacak', icon: '🔥', count: todayLeads.length, color: '#F5A623' },
    { id: 'komisyon', title: 'Yüksek Komisyon', icon: '💰', count: highCommLeads.length, color: '#10B981' },
    { id: 'uyuyan', title: 'Uyuyan Leadler', icon: '😴', count: sleepingLeads.length, color: '#3B82F6' },
  ];

  const currentLeads = activeTab === 'kaybedilecek' ? losingLeads :
                       activeTab === 'bugun' ? todayLeads :
                       activeTab === 'komisyon' ? highCommLeads :
                       sleepingLeads;

  const currentTabInfo = tabs.find(t => t.id === activeTab);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
  };

  const handleAction = (actionName, lead, e) => {
    e.stopPropagation();
    if (actionName === 'call') {
      window.location.href = `tel:${lead.phone.replace(/[^0-9]/g, '')}`;
    } else if (actionName === 'whatsapp') {
      window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank');
    } else if (onActionClick) {
      onActionClick({ leadId: lead.id });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#2A2D35]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 flex items-center gap-2 text-[13px] font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-[#F1F2F4]' : 'text-[#7C8090] hover:text-[#F1F2F4]'
            }`}
          >
            <span>{tab.icon} {tab.title}</span>
            {tab.count > 0 && (
              <span className="bg-error text-white text-[10px] px-1.5 py-0.5 rounded font-bold leading-none">
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            {currentLeads.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant text-[13px]">
                Bu kategoride lead bulunmuyor.
              </div>
            ) : (
              currentLeads.map(lead => {
                const daysAgo = getDaysAgo(lead.updated_at);
                let daysColor = 'var(--color-on-surface-variant)';
                if (daysAgo >= 14) daysColor = 'var(--color-error)';
                else if (daysAgo >= 7) daysColor = 'var(--color-primary)';

                const budget = getBudgetVal(lead);
                const commission = budget * 0.02;

                // Mock Risk Calculation
                let riskPercent = Math.min(99, daysAgo * 5);
                if (lead.score < 5) riskPercent += 20;
                let riskColor = 'var(--color-success)';
                if (riskPercent >= 80) riskColor = 'var(--color-error)';
                else if (riskPercent >= 60) riskColor = 'var(--color-primary)';

                // Parse AI properties
                let insight = '';
                if (lead.properties) {
                  try {
                     const p = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
                     insight = p.ai_insight || p.reason || lead.reasoning || '';
                  } catch(e){}
                }
                if (!insight) {
                  insight = `Son görüşmede ${budget/1000000}M bütçe civarı arayışta olduğunu belirtti. ${daysAgo} gündür aranmadı.`;
                }

                return (
                  <div key={lead.id} className="bg-[#16181D] rounded-[8px] border-l-[4px] p-[18px] border-y border-r border-[#2A2D35] flex flex-col gap-4" style={{ borderLeftColor: currentTabInfo.color }}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-bold text-[#F1F2F4] uppercase">{lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz Lead' : lead.name}</span>
                          <span className="font-mono text-[13px] text-[#7C8090]">{lead.score}/10</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] uppercase tracking-wider">
                            {lead.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#7C8090] mt-1">{lead.phone}</p>
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-[#2A2D35]" />

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase text-[#7C8090] font-semibold">Son Temas</span>
                        <span className="text-[16px] font-mono" style={{ color: daysColor }}>{daysAgo} gün önce</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase text-[#7C8090] font-semibold">Tahmini İşlem</span>
                        <span className="text-[16px] font-mono text-[#10B981]">{formatMoney(budget)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase text-[#7C8090] font-semibold">Kayıp Riski</span>
                        <span className="text-[16px] font-mono" style={{ color: riskColor }}>%{Math.floor(riskPercent)}</span>
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-[#2A2D35]" />

                    {/* AI Note */}
                    <div className="bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] p-3 flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase text-[#7C8090] font-bold">🤖 AI Notu:</span>
                      <p className="text-[13px] text-[#F1F2F4] line-clamp-3 leading-relaxed">
                        "{insight}"
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-1">
                      <button 
                        onClick={(e) => handleAction('call', lead, e)}
                        className="flex-1 bg-[#F5A623] hover:bg-[#d9921e] text-[#0A0B0D] font-bold text-[13px] py-2.5 rounded-md transition-colors flex justify-center items-center gap-2"
                      >
                        📞 Hemen Ara
                      </button>
                      <button 
                        onClick={(e) => handleAction('whatsapp', lead, e)}
                        className="flex-1 bg-[#0A1A0A] border border-[#0A1A0A] hover:bg-[#0f240f] text-[#25D366] font-bold text-[13px] py-2.5 rounded-md transition-colors flex justify-center items-center gap-2"
                      >
                        💬 WhatsApp
                      </button>
                      <button 
                        onClick={(e) => handleAction('detail', lead, e)}
                        className="w-[50px] flex justify-center items-center border border-[#2A2D35] hover:bg-[#2A2D35] text-[#F1F2F4] py-2.5 rounded-md transition-colors"
                      >
                        Detay →
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
