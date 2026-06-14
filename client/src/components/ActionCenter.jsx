import React from 'react';
import { motion } from 'framer-motion';

export default function ActionCenter({ leads = [], onActionClick }) {
  const actions = [];
  
  const hotLeads = leads.filter(l => l.label === 'Sıcak' && l.score >= 8);
  const uncontacted = leads.filter(l => !l.status || l.status === 'Takipte');
  
  if (hotLeads.length > 0) {
    const lead = hotLeads[0];
    actions.push({
      id: `hot_${lead.id}`,
      icon: <span className="material-symbols-outlined text-[20px] text-[#F5A623]">bolt</span>,
      title: `${lead.name} Çok Sıcak!`,
      description: 'Yüksek bütçeli ve acil. Dış kaynakta tam ona göre 1 fırsat var.',
      buttonText: 'Hemen Ara',
      leadId: lead.id,
      phone: lead.phone,
      actionName: 'call',
      containerClass: 'border-[#F5A623]/30 bg-[#F5A623]/5',
      btnClass: 'bg-[#F5A623] hover:bg-[#d9921e] text-[#0A0B0D] border-none'
    });
  }

  if (uncontacted.length > 1) {
    const lead = uncontacted[1];
    actions.push({
      id: `uncontacted_batch`,
      icon: <span className="material-symbols-outlined text-[20px] text-[#EF4444]">warning</span>,
      title: `${uncontacted.length} Bekleyen Fırsat`,
      description: 'Dünden beri işlem yapılmayan müşteriler var. Soğumadan mesaj at.',
      buttonText: 'WhatsApp Gönder',
      leadId: lead.id,
      phone: lead.phone,
      actionName: 'whatsapp',
      containerClass: 'border-[#EF4444]/30 bg-[#EF4444]/5',
      btnClass: 'bg-[#EF4444] hover:bg-[#c83737] text-white border-none'
    });
  }

  const coldLeads = leads.filter(l => l.label === 'Soğuk' || l.score < 40);
  if (coldLeads.length > 0) {
    const dormant = coldLeads[0];
    actions.push({
      id: `dormant_1`,
      icon: <span className="material-symbols-outlined text-[20px] text-[#10B981]">trending_up</span>,
      title: 'Fırsat Sinyali: Uyuyan Müşteri',
      description: `${dormant.name} bir süredir işlem görmedi. Tam hamle zamanı.`,
      buttonText: 'Uyandır (AI Mesajı)',
      leadId: dormant.id,
      phone: dormant.phone,
      actionName: 'wakeup',
      containerClass: 'border-[#10B981]/30 bg-[#10B981]/5',
      btnClass: 'bg-transparent border border-[#2A2D35] text-[#F1F2F4] hover:bg-[#2A2D35]'
    });
  }

  if (actions.length === 0) return null;

  const handleButtonClick = (action) => {
    if (action.actionName === 'call' && action.phone) {
      window.location.href = `tel:${action.phone.replace(/[^0-9]/g, '')}`;
    } else if (action.actionName === 'whatsapp' && action.phone) {
      window.open(`https://wa.me/${action.phone.replace(/[^0-9]/g, '')}`, '_blank');
    } else if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <div className="mb-8 shrink-0">
      <h2 className="text-sm font-bold text-[#7C8090] uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">assistant_navigation</span>
        Günün AI Komutları
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.slice(0, 3).map((action, i) => (
          <motion.div 
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border flex flex-col justify-between shadow-lg ${action.containerClass}`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                {action.icon}
                <h3 className="font-bold text-sm text-[#F1F2F4]">{action.title}</h3>
              </div>
              <p className="text-[12px] text-[#7C8090] leading-relaxed mb-4">{action.description}</p>
            </div>
            <button 
              onClick={() => handleButtonClick(action)}
              className={`w-full py-2.5 rounded-lg text-[13px] font-bold transition-all shadow-md ${action.btnClass}`}
            >
              {action.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
