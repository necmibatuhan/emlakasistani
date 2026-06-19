import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCountUp } from '../../hooks/useCountUp';

export default function Step1LossAversion({ token, onNext, onCancel, onDirectExit }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/subscription/cancel-intent`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
        // Fallback stats
        setStats({ customer_count: 0, portfolio_count: 0, contact_count: 0, days_active: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const customerCount = useCountUp(stats?.customer_count || 0);
  const portfolioCount = useCountUp(stats?.portfolio_count || 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-pulse">
        <div className="h-6 w-1/2 bg-surface-container rounded mb-8"></div>
        <div className="flex w-full gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-surface-container rounded w-full"></div>
            <div className="h-4 bg-surface-container rounded w-5/6"></div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-surface-container rounded w-full"></div>
            <div className="h-4 bg-surface-container rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl">warning</span>
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-6">Kapora'yı iptal etmeden önce...</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mb-8">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-error/20">
          <h3 className="text-error font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">cancel</span>
            Kaybedecekleriniz
          </h3>
          <ul className="space-y-3 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">close</span>
              <span>Yapay zeka öncelik skoru ve günlük "kimi ara" rehberliği</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">close</span>
              <span><strong className="text-on-surface">{customerCount}</strong> müşteri kaydı ve akıllı geçmiş notları</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">close</span>
              <span><strong className="text-on-surface">{portfolioCount}</strong> portföy eşleşmesi ve analizi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">close</span>
              <span>Hazır WhatsApp şablonları ve iletişim geçmişi</span>
            </li>
          </ul>
        </div>

        <div className="bg-primary/5 p-5 rounded-xl border border-primary/20">
          <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">trending_up</span>
            Rakibiniz bu sürede
          </h3>
          <ul className="space-y-3 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">monitoring</span>
              <span>Kapora kullanan danışmanlar ayda ortalama <strong>2.3 ekstra kapanış</strong> yapıyor.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
              <span>Sadece bu ay Kapora asistanı sayesinde binlerce lira ekstra komisyon kazanıldı. Piyasayı rakiplerinize bırakmayın.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col w-full gap-3">
        <button 
          onClick={onCancel}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-lg transition-colors shadow-lg"
        >
          Kalmak İstiyorum
        </button>
        <button 
          onClick={onNext}
          className="w-full bg-surface-container hover:bg-outline-variant text-on-surface font-semibold py-3 rounded-lg transition-colors"
        >
          Neden İptal Ettiğimi Söyleyeyim
        </button>
        <button 
          onClick={onDirectExit}
          className="w-full text-on-surface-variant hover:text-error text-sm font-medium py-2 transition-colors mt-2"
        >
          Yine de iptal et
        </button>
      </div>
    </div>
  );
}
