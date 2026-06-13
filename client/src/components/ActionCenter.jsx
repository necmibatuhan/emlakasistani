import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, PhoneForwarded, Zap } from 'lucide-react';
import clsx from 'clsx';

export default function ActionCenter({ leads = [], onActionClick }) {
  // Generate proactive actions based on leads
  const actions = [];
  
  const hotLeads = leads.filter(l => l.label === 'Sıcak' && l.score >= 8);
  const uncontacted = leads.filter(l => !l.status || l.status === 'Takipte');
  
  if (hotLeads.length > 0) {
    actions.push({
      id: `hot_${hotLeads[0].id}`,
      type: 'urgent',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: `${hotLeads[0].name} Çok Sıcak!`,
      description: 'Yüksek bütçeli ve acil. Dış kaynakta tam ona göre 1 fırsat var.',
      buttonText: 'Hemen Ara',
      leadId: hotLeads[0].id,
      color: 'border-amber-500/50 bg-amber-500/10 text-amber-100',
      btnColor: 'bg-amber-500 hover:bg-amber-600 text-black'
    });
  }

  if (uncontacted.length > 1) {
    actions.push({
      id: `uncontacted_batch`,
      type: 'warning',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      title: `${uncontacted.length} Bekleyen Fırsat`,
      description: 'Dünden beri işlem yapılmayan müşteriler var. Soğumadan mesaj at.',
      buttonText: 'WhatsApp Toplu Gönder',
      leadId: uncontacted[1].id,
      color: 'border-rose-500/50 bg-rose-500/10 text-rose-100',
      btnColor: 'bg-rose-500 hover:bg-rose-600 text-white'
    });
  }

  const coldLeads = leads.filter(l => l.label === 'Soğuk' || l.score < 40);
  if (coldLeads.length > 0) {
    const dormant = coldLeads[0];
    actions.push({
      id: `dormant_1`,
      type: 'opportunity',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      title: 'Fırsat Sinyali: Uyuyan Müşteri',
      description: `${dormant.name} bir süredir işlem görmedi. Tam hamle zamanı.`,
      buttonText: 'Uyandır (AI Mesajı)',
      leadId: dormant.id,
      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100',
      btnColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      actionName: 'wakeup'
    });
  }

  if (actions.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
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
            className={clsx("p-4 rounded-xl border flex flex-col justify-between shadow-lg backdrop-blur-md", action.color)}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                {action.icon}
                <h3 className="font-bold text-sm">{action.title}</h3>
              </div>
              <p className="text-xs opacity-80 leading-relaxed mb-4">{action.description}</p>
            </div>
            <button 
              onClick={() => onActionClick && onActionClick(action)}
              className={clsx("w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-md", action.btnColor)}
            >
              {action.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
