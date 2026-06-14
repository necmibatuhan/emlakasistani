import React from 'react';
import { motion } from 'framer-motion';

export default function ActionCenter({ leads = [], onActionClick }) {
  const actions = [];
  
  const hotLeads = leads.filter(l => l.label === 'Sıcak' && l.score >= 8);
  const uncontacted = leads.filter(l => !l.status || l.status === 'Takipte');
  const coldLeads = leads.filter(l => l.label === 'Soğuk' || l.score < 40);

  if (hotLeads.length > 0) {
    actions.push({
      id: `hot_${hotLeads[0].id}`,
      icon: '🔴',
      text: `${hotLeads[0].name} — Yüksek bütçeli, bugün ara`,
      buttonText: 'Ara →',
      leadId: hotLeads[0].id,
      actionName: 'call'
    });
  }

  if (uncontacted.length > 1) {
    actions.push({
      id: `uncontacted_batch`,
      icon: '⚠️',
      text: `${uncontacted.length} lead dünden beri işlem görmedi`,
      buttonText: 'Gör →',
      leadId: uncontacted[1].id,
      actionName: 'view'
    });
  }

  if (coldLeads.length > 0) {
    const dormant = coldLeads[0];
    actions.push({
      id: `dormant_1`,
      icon: '💤',
      text: `${dormant.name} — Uyuyan müşteri, mesaj zamanı`,
      buttonText: 'Yaz →',
      leadId: dormant.id,
      actionName: 'wakeup'
    });
  }

  if (actions.length === 0) return null;

  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  return (
    <div className="mb-6">
      <div className="bg-[#16181D] rounded-[8px] border-l-[3px] border-l-[#F5A623] border-y border-r border-[#2A2D35] p-5 shadow-md">
        <div className="flex justify-between items-center mb-4 border-b border-[#2A2D35] pb-2">
           <h2 className="text-[14px] font-medium text-[#F1F2F4]">Bugün odaklanılacaklar</h2>
           <span className="text-[12px] text-[#7C8090]">{today}</span>
        </div>
        <div className="flex flex-col gap-3">
          {actions.map((action, i) => (
            <motion.div 
              key={action.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-[14px]">{action.icon}</span>
                <span className="text-[13px] text-[#F1F2F4]">{action.text}</span>
              </div>
              <button 
                onClick={() => onActionClick && onActionClick(action)}
                className="text-[11px] text-[#F1F2F4] border border-[#2A2D35] rounded-md px-3 py-1.5 hover:bg-[#1E2028] transition-colors"
              >
                {action.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
