import React from 'react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// This is a mockup of the Command Center categories.
// In the final version, this data will come from the backend's ActionEngineService.
const CATEGORIES = [
  {
    id: 'urgent_call',
    title: 'Hemen Ara',
    icon: '🔥',
    color: 'text-status-hot',
    bg: 'bg-status-hot/10 border-status-hot/30',
    description: 'Sıcak ve acil dönüş bekleyenler.'
  },
  {
    id: 'at_risk',
    title: 'Kaybedilmek Üzere',
    icon: '🚨',
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10 border-[#EF4444]/30',
    description: '7+ gündür temas kurulmayan sıcak müşteriler.'
  },
  {
    id: 'high_commission',
    title: 'En Yüksek Komisyon',
    icon: '💰',
    color: 'text-[#10B981]',
    bg: 'bg-[#10B981]/10 border-[#10B981]/30',
    description: 'Bütçesi en yüksek, kapanmaya en yakın işler.'
  },
  {
    id: 'new_matches',
    title: 'Yeni Eşleşmeler',
    icon: '🏠',
    color: 'text-[#3B82F6]',
    bg: 'bg-[#3B82F6]/10 border-[#3B82F6]/30',
    description: 'Portföylerle uyuşan geçmiş müşteriler.'
  },
  {
    id: 'dormant',
    title: 'Uyuyan Leadler',
    icon: '😴',
    color: 'text-[#8E929C]',
    bg: 'bg-[#8E929C]/10 border-[#8E929C]/30',
    description: '30+ gündür sessiz olanları dürtme zamanı.'
  }
];

const ActionCard = ({ action, onActionClick }) => {
  return (
    <div className="bg-surface-container-high border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-outline transition-colors cursor-pointer" onClick={() => onActionClick(action.lead_id)}>
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-on-surface text-[14px] leading-tight">{action.lead_name}</h4>
        {action.expected_commission && (
          <span className="font-mono text-[12px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
            ₺{action.expected_commission}
          </span>
        )}
      </div>
      
      <p className="text-[12px] text-on-surface-variant font-medium leading-relaxed">
        {action.reason}
      </p>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold text-[#8E929C]">
          Önerilen Aksiyon:
        </span>
      </div>
      
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (action.action_type === 'call') {
            window.location.href = `tel:${action.lead_phone || ''}`;
          } else if (action.action_type === 'whatsapp') {
            const text = encodeURIComponent(action.whatsapp_draft || 'Merhaba, görüşmemizle ilgili size ulaşmak istedim.');
            window.open(`https://wa.me/${action.lead_phone?.replace(/[^0-9]/g, '') || ''}?text=${text}`, '_blank');
          } else {
            onActionClick(action.lead_id); 
          }
        }}
        className="w-full bg-surface-container-lowest hover:bg-outline-variant text-on-surface text-[12px] font-bold py-2 px-3 rounded border border-outline flex items-center justify-center gap-2 transition-colors"
      >
        {action.suggested_action_icon && <span className="material-symbols-outlined text-[16px]">{action.suggested_action_icon}</span>}
        {action.suggested_action_text}
      </button>
    </div>
  );
};

const CommandCenter = ({ leads, onLeadSelect }) => {
  // Temporary mock logic to distribute existing leads into the 5 categories
  // In the real system, the backend provides an array of pre-calculated 'actions'
  
  const generateMockActions = () => {
    const actions = {
      urgent_call: [],
      at_risk: [],
      high_commission: [],
      new_matches: [],
      dormant: []
    };

    leads.forEach((lead, index) => {
      // Mock distribution
      if (lead.label === 'Sıcak' && index % 2 === 0) {
        actions.urgent_call.push({
          lead_id: lead.id,
          lead_name: lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz' : lead.name,
          lead_phone: lead.phone,
          expected_commission: '45.000',
          reason: 'Dün fiyat sormuştu, bugün dönüş bekliyor. Hemen ara.',
          suggested_action_text: 'Hemen Ara',
          suggested_action_icon: 'call',
          action_type: 'call'
        });
      } else if (lead.label === 'Sıcak' && index % 2 !== 0) {
        actions.at_risk.push({
          lead_id: lead.id,
          lead_name: lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz' : lead.name,
          lead_phone: lead.phone,
          expected_commission: '120.000',
          reason: '8 gündür aranmadı. Başka emlakçıya gidebilir.',
          suggested_action_text: 'Kurtarma Mesajı At',
          suggested_action_icon: 'chat',
          action_type: 'whatsapp',
          whatsapp_draft: `Merhaba ${lead.name === '[İsim Belirtilmedi]' ? '' : lead.name}, geçen hafta görüşmüştük. Arayışınız devam ediyor mu?`
        });
      } else if (lead.label === 'Ilık' && index % 3 === 0) {
         actions.high_commission.push({
          lead_id: lead.id,
          lead_name: lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz' : lead.name,
          lead_phone: lead.phone,
          expected_commission: '350.000',
          reason: 'Bütçesi yüksek, lüks segment arayışında. Yeni fırsat sun.',
          suggested_action_text: 'Özel Portföy Gönder',
          suggested_action_icon: 'home',
          action_type: 'whatsapp',
          whatsapp_draft: `${lead.name === '[İsim Belirtilmedi]' ? 'Merhaba' : 'Merhaba ' + lead.name}, bütçenize uygun yeni ve çok özel bir portföyümüz var, detayları iletmemi ister misiniz?`
        });
      } else if (index % 4 === 0) {
         actions.new_matches.push({
          lead_id: lead.id,
          lead_name: lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz' : lead.name,
          lead_phone: lead.phone,
          expected_commission: '60.000',
          reason: 'Dün girdiğiniz Kadıköy 3+1 portföyü ile %92 eşleşiyor.',
          suggested_action_text: 'Eşleşmeyi Gönder',
          suggested_action_icon: 'send',
          action_type: 'whatsapp',
          whatsapp_draft: `Merhaba ${lead.name === '[İsim Belirtilmedi]' ? '' : lead.name}, aradığınız kriterlere %92 uyan Kadıköy'de 3+1 yeni bir ilanımız portföye eklendi. Linki iletiyorum.`
        });
      } else if (lead.label === 'Soğuk') {
        actions.dormant.push({
          lead_id: lead.id,
          lead_name: lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz' : lead.name,
          lead_phone: lead.phone,
          reason: '45 gündür işlem yok. Piyasayı yokla.',
          suggested_action_text: 'Uyandırma Mesajı',
          suggested_action_icon: 'notifications_active',
          action_type: 'whatsapp',
          whatsapp_draft: `Merhaba ${lead.name === '[İsim Belirtilmedi]' ? '' : lead.name}, piyasa şu an oldukça hareketli. Mevcut arayışınızla ilgili yardımcı olabileceğimiz yeni fırsatlar doğdu, müsait bir zamanda görüşebilir miyiz?`
        });
      }
    });

    return actions;
  };

  const actionMap = generateMockActions();

  let totalCommission = 0;
  Object.values(actionMap).forEach(actionList => {
    actionList.forEach(action => {
      if (action.expected_commission) {
        const val = parseInt(action.expected_commission.replace(/\./g, ''), 10);
        if (!isNaN(val)) totalCommission += val;
      }
    });
  });

  const formattedCommission = totalCommission === 0 ? '0' : totalCommission.toLocaleString('tr-TR');

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
           <h2 className="text-2xl font-display-md text-on-surface tracking-tight">Satış Aksiyon Merkezi</h2>
           <p className="text-sm text-on-surface-variant mt-1">Bugün odaklanmanız gereken komisyon üretecek aksiyonlar.</p>
        </div>
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 px-4 py-2 rounded-lg flex items-center gap-3">
           <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">Masadaki Toplam Komisyon</span>
           <span className="font-mono text-xl font-bold text-[#10B981]">₺{formattedCommission}</span>
        </div>
      </div>

      {/* 5 Sütunlu Yatay Kaydırılabilir Grid */}
      <div className="flex-1 flex gap-4 overflow-x-auto custom-scrollbar pb-4">
        {CATEGORIES.map(category => (
          <div key={category.id} className="min-w-[300px] w-[300px] flex flex-col h-full bg-surface-container/50 border border-outline/50 rounded-2xl overflow-hidden shrink-0">
            {/* Header */}
            <div className={clsx("p-4 border-b shrink-0 flex flex-col gap-1", category.bg)}>
              <h3 className={clsx("font-bold text-[15px] flex items-center gap-2", category.color)}>
                <span>{category.icon}</span> {category.title}
                <span className="ml-auto bg-background/50 px-2 py-0.5 rounded-full text-[12px] border border-outline">
                  {actionMap[category.id].length}
                </span>
              </h3>
              <p className="text-[11px] text-on-surface-variant/80 font-medium">{category.description}</p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
              {actionMap[category.id].length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50 gap-2">
                  <span className="material-symbols-outlined text-[32px]">done_all</span>
                  <span className="text-[12px] font-medium">Bu liste temiz.</span>
                </div>
              ) : (
                actionMap[category.id].map((action, i) => (
                  <ActionCard key={i} action={action} onActionClick={onLeadSelect} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommandCenter;
