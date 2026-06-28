import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';

export default function Step3Offer({ offer, reason, onAccept, onReject, loading }) {
  const { minutes, seconds, isExpired } = useCountdown(10); // 10 minutes

  const isWarning = minutes < 2;

  const renderOfferContent = () => {
    if (!offer) return null;

    if (offer.type === 'discount') {
      return (
        <div className="bg-gradient-to-br from-primary/20 to-surface-container border border-primary/30 p-6 rounded-2xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <span className="material-symbols-outlined text-primary text-3xl">redeem</span>
            <h3 className="text-xl font-bold text-on-surface">Size Özel Teklif</h3>
          </div>
          
          <div className="mt-6 space-y-2 relative z-10">
            <div className="text-3xl font-black text-primary">%{offer.discount_percent} İndirim</div>
            <div className="text-on-surface-variant font-medium">Sonraki {offer.duration_months || 2} ay boyunca</div>
          </div>

          <div className="mt-6 flex items-end gap-3 relative z-10">
            <span className="text-2xl text-on-surface-variant line-through opacity-70">₺{offer.old_price || 899}</span>
            <span className="text-4xl font-bold text-on-surface">₺{offer.new_price || 449}<span className="text-lg text-on-surface-variant font-normal">/ay</span></span>
          </div>

          <div className={`mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm transition-colors ${isExpired ? 'bg-error/20 text-error' : isWarning ? 'bg-error/20 text-error animate-pulse' : 'bg-status-warm/20 text-status-warm'}`}>
            <span className="material-symbols-outlined text-[18px]">timer</span>
            {isExpired ? 'Teklif süresi doldu' : `Bu teklif ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} içinde geçerli`}
          </div>
        </div>
      );
    }

    if (offer.type === 'feature_promise') {
      return (
        <div className="bg-surface-container border border-primary/30 p-6 rounded-2xl mb-6 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">construction</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">İstediğiniz Özelliği Ekleyeceğiz!</h3>
          <p className="text-on-surface-variant mb-4">Bize biraz zaman verin. Söz veriyoruz, istediğiniz özelliği yakında çıkaracağız.</p>
          <div className="bg-primary/10 text-primary font-bold py-2 px-4 rounded-lg inline-block">
            🎁 Telafi olarak {offer.extra_months_free} ay ücretsiz kullanım hediye ediyoruz.
          </div>
        </div>
      );
    }

    if (offer.type === 'free_coaching') {
      return (
        <div className="bg-surface-container border border-primary/30 p-6 rounded-2xl mb-6 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">Ücretsiz Onboarding Koçluğu</h3>
          <p className="text-on-surface-variant mb-4">Kapora'yı tam potansiyeliyle kullanmanız için size özel 1 saatlik birebir eğitim seansı hediye ediyoruz.</p>
          <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
            <span className="material-symbols-outlined">event</span>
            Toplantı Ayarla (Calendly)
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6 md:p-8">
      {renderOfferContent()}

      <div className="flex flex-col w-full gap-3 mt-8">
        <button 
          onClick={onAccept}
          disabled={loading || (offer?.type === 'discount' && isExpired)}
          className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3.5 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? 'İşleniyor...' : offer?.type === 'discount' ? 'Teklifi Kabul Et' : 'Hediyemi Al ve Kal'}
        </button>
        <button 
          onClick={onReject}
          disabled={loading}
          className="w-full bg-surface-container hover:bg-outline-variant text-on-surface font-medium py-3 rounded-lg transition-colors"
        >
          İptal Etmeye Devam Et
        </button>
      </div>
    </div>
  );
}
