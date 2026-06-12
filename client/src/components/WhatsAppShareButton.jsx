import React, { useState } from 'react';
import { MessageCircle, Check } from 'lucide-react';
import clsx from 'clsx';

/**
 * Premium "WhatsApp ile Paylaş" Butonu
 * Kopyalama işlemi yapar ve mikro-interaksiyonla kullanıcıya geri bildirim verir.
 */
export default function WhatsAppShareButton({ 
  message = "Merhaba, sizin için harika bir portföy buldum!", 
  phoneNumber = "", // Opsiyonel: Eğer numara varsa doğrudan WhatsApp Web'e de yönlendirebiliriz
  className = "" 
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation(); // Tıklamanın ebeveyn kartları (LeadCard) tetiklemesini engeller
    
    try {
      // 1. Panoya Kopyala
      await navigator.clipboard.writeText(message);
      
      // 2. Başarı Animasyonu (Check ikonu)
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Opsiyonel 3. Eğer telefonda ise veya WhatsApp Web açıksa direkt uygulamaya yönlendir
      // if (phoneNumber) {
      //   const cleanPhone = phoneNumber.replace(/\D/g, '');
      //   const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      //   window.open(waUrl, '_blank');
      // }

    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={clsx(
        "group relative flex items-center justify-center gap-2 overflow-hidden rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-300",
        copied 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
          : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700",
        className
      )}
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        <MessageCircle 
          className={clsx(
            "absolute transition-all duration-300", 
            copied ? "scale-0 opacity-0" : "scale-100 opacity-100 group-hover:text-green-400"
          )} 
        />
        <Check 
          className={clsx(
            "absolute transition-all duration-300", 
            copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )} 
        />
      </div>
      
      <span>{copied ? 'Kopyalandı' : 'WhatsApp İletisi'}</span>
    </button>
  );
}
