import React from 'react';
import { Flame, Clock, Home, ArrowRight, User, AlertTriangle } from 'lucide-react';
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
  onClick
}) {
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

      {/* Alt Kısım: Eşleşen Portföy & Aksiyon */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-400">
          <Home className="h-4 w-4" />
          <span className="text-xs font-medium">
            {matchedCount > 0 ? (
              <span className="text-zinc-200">{matchedCount} Eşleşen Portföy</span>
            ) : (
              <span>Eşleşme Bekleniyor</span>
            )}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* WhatsApp ile Paylaş Butonu */}
          {whatsappDraft && <WhatsAppShareButton message={whatsappDraft} />}
          
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-all duration-300">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
