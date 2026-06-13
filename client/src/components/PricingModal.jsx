import React, { useState } from 'react';
import axios from 'axios';
import { Check, X, CreditCard, Sparkles, Zap, Star } from 'lucide-react';

const PricingModal = ({ isOpen, onClose, token, onUpgradeSuccess }) => {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCheckout = async (planType) => {
    setLoadingPlan(planType);
    setError('');
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/payment/shopier-checkout`, {
        plan: planType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        // Mocking Shopier Redirect behavior
        // In a real scenario, this would post a form to Shopier API
        // For Kapora MVP, we simulate a successful callback redirect
        
        // Let's create a dummy HTML form and submit it, or just simulate success immediately
        console.log("Mocking shopier checkout for", res.data.data.product_name);
        
        // Simulating the shopier callback
        setTimeout(async () => {
          try {
            // Simulate the backend callback receiving Shopier's success hook
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/payment/shopier-callback`, {
              status: 'success',
              order_id: res.data.data.platform_order_id,
              custom_data: planType,
              random_nr: res.data.data.random_nr,
              signature: res.data.data.signature,
              currency: 0,
              total_amount: res.data.data.product_price
            });
            
            setLoadingPlan(null);
            onUpgradeSuccess(planType);
            onClose();
          } catch (cbErr) {
            console.error("Callback simulation failed", cbErr);
            setError('Ödeme doğrulaması başarısız oldu.');
            setLoadingPlan(null);
          }
        }, 1500); // 1.5 second loading simulation
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Ödeme sistemi başlatılamadı.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0B0D]/80 backdrop-blur-sm flex justify-center items-center z-[100] p-4 overflow-y-auto">
      <div className="bg-[#16181D] border border-[#2A2D35] rounded-2xl w-full max-w-4xl shadow-2xl relative my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7C8090] hover:text-[#F1F2F4] bg-[#1E2025] hover:bg-[#2A2D35] p-2 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center border-b border-[#2A2D35]">
          <h2 className="text-3xl font-bold text-[#F1F2F4] mb-3">Kapora'nın Gerçek Gücünü Keşfedin</h2>
          <p className="text-[#7C8090] max-w-xl mx-auto">
            İhtiyacınıza uygun planı seçin, sahada zaman kazanın, müşteri kaçırmayın ve satışlarınızı katlayın.
          </p>
        </div>

        {error && (
          <div className="mx-8 mt-6 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* PRO PLAN */}
          <div className="bg-[#1E2025] border border-[#2A2D35] rounded-xl p-6 relative flex flex-col hover:border-[#F5A623]/50 transition-colors">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#F1F2F4] flex items-center gap-2">
                <Zap className="text-[#F5A623]" size={24} />
                Pro
              </h3>
              <p className="text-[#7C8090] text-sm mt-2">Bireysel danışmanlar için ideal paket.</p>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#F1F2F4]">₺299</span>
              <span className="text-[#7C8090]">/ay</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Sınırsız Sesli Not & Yapay Zeka Analizi',
                'Akıllı Müşteri Eşleştirme',
                'Otomatik İlan Sihirbazı',
                'WhatsApp Entegrasyonu (Tek Tık)',
                '1 Emlak Asistanı Hesabı'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="text-[#10B981] mt-0.5 shrink-0" size={18} />
                  <span className="text-[#D1D5DB] text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleCheckout('pro')}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-lg font-medium text-[#F1F2F4] bg-[#2A2D35] hover:bg-[#3A3D45] transition-colors border border-[#3A3D45] flex items-center justify-center gap-2"
            >
              {loadingPlan === 'pro' ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pro'ya Yükselt
                </>
              )}
            </button>
          </div>

          {/* PRO+ PLAN */}
          <div className="bg-gradient-to-b from-[#16181D] to-[#251A0D] border-2 border-[#F5A623] rounded-xl p-6 relative flex flex-col shadow-[0_0_30px_rgba(245,166,35,0.15)]">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#F5A623] text-[#0A0B0D] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Star size={14} fill="currentColor" /> En Çok Tercih Edilen
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xl font-bold text-[#F1F2F4] flex items-center gap-2">
                <Sparkles className="text-[#F5A623]" size={24} />
                Pro+
              </h3>
              <p className="text-[#7C8090] text-sm mt-2">Takımlar ve ofis yöneticileri için sınırları kaldırın.</p>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#F1F2F4]">₺599</span>
              <span className="text-[#7C8090]">/ay</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Pro paketteki tüm özellikler',
                'Ekip & Ofis Yönetimi',
                'Gelişmiş Performans Raporları',
                'Sınırsız İlan & Portföy Eşleştirme',
                'Öncelikli Müşteri Desteği (7/24)'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="text-[#F5A623] mt-0.5 shrink-0" size={18} />
                  <span className="text-[#F1F2F4] text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleCheckout('proplus')}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-lg font-bold text-[#0A0B0D] bg-[#F5A623] hover:bg-[#d9921e] transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,166,35,0.4)] hover:shadow-[0_0_25px_rgba(245,166,35,0.6)]"
            >
              {loadingPlan === 'proplus' ? (
                <div className="w-5 h-5 border-2 border-[#0A0B0D]/20 border-t-[#0A0B0D] rounded-full animate-spin"></div>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pro+'a Yükselt
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#2A2D35] text-center text-xs text-[#7C8090]">
          Ödemeleriniz <span className="font-semibold text-[#F1F2F4]">Shopier</span> güvencesiyle 256-bit SSL şifreleme ile korunmaktadır. Test ortamıdır, kart bilgisi gerektirmez.
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
