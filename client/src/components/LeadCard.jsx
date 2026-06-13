import React, { useState } from 'react';
import { Flame, Clock, Home, ArrowRight, User, AlertTriangle, Sparkles } from 'lucide-react';
import WhatsAppShareButton from './WhatsAppShareButton';

/**
 * Premium Lead Card Component
 * Designed for Dark Mode, Geist Font, and High Contrast.
 */
export default function LeadCard({
  name = "Belirtilmedi",
  phone = "Telefon Yok",
  score = 0,
  urgency = "low", // 'high' | 'medium' | 'low'
  actionType = "unknown", // 'rent' | 'sale'
  propertyType = "apartment",
  roomCount = "Bilinmiyor",
  budgetStr = "Bütçe Belirsiz",
  summary = "Herhangi bir özet bilgisi girilmemiş.",
  matchedCount = 0,
  whatsappDraft = null,
  redFlag = false,
  redFlagReason = null,
  onWakeUp,
  onClick
}) {
  const [isWakingUp, setIsWakingUp] = useState(false);

  const handleWakeUp = async (e) => {
    e.stopPropagation();
    if (!onWakeUp) return;
    setIsWakingUp(true);
    try {
      await onWakeUp();
    } finally {
      setIsWakingUp(false);
    }
  };
  // Aciliyet (Urgency) bazlı renk ve ikon ayarlamaları
  const getUrgencyConfig = () => {
    switch (urgency) {
      case 'high': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: <Flame className="w-3.5 h-3.5" /> };
      case 'medium': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: <Clock className="w-3.5 h-3.5" /> };
      default: return { color: 'text-zinc-400', bg: 'bg-zinc-800/50', border: 'border-zinc-700/50', icon: null };
    }
  };

  const urgencyConfig = getUrgencyConfig();

  // İşlem türünü Türkçeleştir
  const actionLabel = actionType === 'rent' ? 'Kiralık' : actionType === 'sale' ? 'Satılık' : 'Belirsiz';

  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50 cursor-pointer overflow-hidden font-sans tracking-tight"
    >
      {/* İnce Glow Efekti (Sadece Hover'da) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-zinc-800/0 via-zinc-800/0 to-zinc-800/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Üst Kısım: Kimlik & Skor */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-zinc-200 transition-colors">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm">{name}</h3>
            <p className="text-xs text-zinc-500">{phone}</p>
          </div>
        </div>

        {/* Lead Score Badge */}
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${urgencyConfig.bg} ${urgencyConfig.color} ${urgencyConfig.border}`}>
          {urgencyConfig.icon}
          <span>%{score} Etkileşim</span>
        </div>
      </div>
      
      {/* Risk Badge (Red Flag) */}
      {redFlag && (
        <div className="mb-3 flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block mb-0.5">Riskli Müşteri</span>
            <span className="text-red-400/80 line-clamp-2">{redFlagReason || 'Yapay zeka bu lead için risk tespit etti.'}</span>
          </div>
        </div>
      )}

      {/* Orta Kısım: İstek Detayları & Ses Notu Özeti */}
      <div className="flex-1">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300 border border-zinc-800">
            {actionLabel}
          </span>
          {roomCount && roomCount !== "Bilinmiyor" && (
            <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300 border border-zinc-800">
              {roomCount}
            </span>
          )}
          <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-amber-500/80 border border-amber-500/10">
            {budgetStr}
          </span>
        </div>
        
        <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2 group-hover:text-zinc-300 transition-colors">
          "{summary}"
        </p>
      </div>

      {/* Alt Kısım: Hızlı Triage Aksiyonları */}
      <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
        {whatsappDraft && <WhatsAppShareButton message={whatsappDraft} className="flex-1 min-w-[120px]" />}
        
        {/* Uyandır AI Mesajı Butonu (Fırsat Sinyali) */}
        {!whatsappDraft && (
          <button
            onClick={handleWakeUp}
            disabled={isWakingUp}
            className="bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 flex-1 min-w-[120px] justify-center disabled:opacity-50"
            title="Uyuyan Alıcıyı Yapay Zeka ile Uyandır (Fırsat Sinyali)"
          >
            {isWakingUp ? (
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            AI Uyandır
          </button>
        )}

        <a 
          href={`tel:${phone.replace(/[^0-9]/g, '')}`} 
          onClick={(e) => e.stopPropagation()} 
          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400 rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 flex-1 justify-center min-w-[80px]"
        >
          Ara
        </a>
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(); }} 
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 transition-all duration-300"
          title="Detayları Gör"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
