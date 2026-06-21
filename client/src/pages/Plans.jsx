import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, ChevronDown, ChevronUp } from 'lucide-react';

const Plans = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [betaCode, setBetaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isYearly, setIsYearly] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const navigate = useNavigate();

  const handlePayment = async (plan) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/payment/iyzico-checkout`, { 
        plan, 
        billingCycle: isYearly ? 'yearly' : 'monthly' 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success && res.data.data.paymentPageUrl) {
        window.location.href = res.data.data.paymentPageUrl + '&iframe=false';
      } else if (res.data.success && res.data.data.htmlContent) {
        const newWindow = window.open('', '_self');
        newWindow.document.write(res.data.data.htmlContent);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme sistemi başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (betaCode.toUpperCase() !== 'EMLAK2025') {
        throw new Error('Geçersiz beta kodu.');
      }

      const res = await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/auth/upgrade`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setSuccess('Tebrikler! PRO+ planına yükseltildiniz.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Yükseltme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: 'Kredi kartı gerekiyor mu?', a: 'Hayır. 14 günlük deneme için kredi kartı bilgisi istemiyoruz.' },
    { q: 'İstediğim zaman iptal edebilir miyim?', a: 'Evet. Herhangi bir zamanda iptal edebilirsiniz. Kalan günler için ücret alınmaz.' },
    { q: 'Yıllık plandan aylıya geçebilir miyim?', a: 'Evet, dönem sonunda plan değişikliği yapılır.' },
    { q: 'Faturamı nasıl alırım?', a: 'Her ödeme sonrası e-posta adresinize otomatik fatura gönderilir.' },
    { q: 'Ücretsiz plandan Pro\'ya geçince verilerim ne olur?', a: 'Tüm verileriniz korunur, ekstra özellikler anında aktifleşir.' }
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0B0D]">
      <Sidebar />
      <div className="lg:ml-[240px] flex-1 flex flex-col min-h-screen w-full">
        <Header />
        
        {/* Main Content Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-12 md:py-20 max-w-[1100px] mx-auto w-full">
            
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-[28px] font-medium text-[#F1F2F4] mb-3">Basit fiyatlandırma. Gizli ücret yok.</h1>
              <p className="text-[14px] text-[#7C8090]">
                Her plan 14 gün ücretsiz deneme içerir.<br/>
                Kredi kartı gerekmez.
              </p>
              
              {/* Toggle */}
              <div className="mt-8 flex items-center justify-center">
                <div className="bg-[#2A2D35] p-1 rounded-[8px] inline-flex">
                  <button 
                    onClick={() => setIsYearly(false)}
                    className={`px-4 py-2 text-[13px] font-medium rounded-[6px] transition-colors ${!isYearly ? 'bg-[#F5A623] text-[#0A0B0D]' : 'text-[#7C8090] hover:text-[#F1F2F4]'}`}
                  >
                    Aylık
                  </button>
                  <button 
                    onClick={() => setIsYearly(true)}
                    className={`px-4 py-2 text-[13px] font-medium rounded-[6px] transition-colors ${isYearly ? 'bg-[#F5A623] text-[#0A0B0D]' : 'text-[#7C8090] hover:text-[#F1F2F4]'}`}
                  >
                    Yıllık — %17 indirim
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-start">
              
              {/* FREE CARD */}
              <div className="bg-[#16181D] border border-[#2A2D35] rounded-[10px] p-8 flex flex-col">
                <h3 className="text-[14px] font-medium text-[#7C8090] mb-4">Ücretsiz</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-[36px] font-medium text-[#F1F2F4]">0 ₺</span>
                  <span className="text-[14px] text-[#7C8090] ml-1">/ay</span>
                </div>
                <p className="text-[12px] text-[#7C8090] mb-8">Başlamak için ideal</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> 20 lead / ay</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> AI skorlama</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> WhatsApp taslağı</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Durum takibi</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#2A2D35]"><X className="w-4 h-4 text-[#2A2D35]" /> Sesli not</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#2A2D35]"><X className="w-4 h-4 text-[#2A2D35]" /> Hatırlatıcı</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#2A2D35]"><X className="w-4 h-4 text-[#2A2D35]" /> İstatistikler</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#2A2D35]"><X className="w-4 h-4 text-[#2A2D35]" /> Günlük özet</li>
                </ul>
                
                <button 
                  disabled
                  className="w-full py-2.5 text-center text-[13px] font-medium text-[#F1F2F4] border border-[#2A2D35] rounded-[6px] hover:bg-[#1E2028] transition-colors"
                >
                  Ücretsiz Başla
                </button>
              </div>

              {/* PRO CARD */}
              <div className="bg-[#1A1200] border-[1.5px] border-[#F5A623] rounded-[10px] p-8 flex flex-col relative md:-translate-y-[8px] shadow-[0_10px_40px_-10px_rgba(245,166,35,0.15)]">
                <div className="absolute -top-[12px] left-1/2 transform -translate-x-1/2 bg-[#F5A623] text-[#0A0B0D] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                  EN POPÜLER
                </div>
                <h3 className="text-[14px] font-medium text-[#F5A623] mb-4">Pro</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-[40px] font-medium text-[#F5A623]">{isYearly ? '1.490 ₺' : '149 ₺'}</span>
                  <span className="text-[14px] text-[#7C8090] ml-1">{isYearly ? '/yıl' : '/ay'}</span>
                </div>
                <p className="text-[11px] text-[#7C8090] mb-1">{isYearly ? '2 ay bedava avantajı ile' : 'Yıllık ödemede 1.490 ₺'}</p>
                <p className="text-[12px] text-[#7C8090] mb-8">Aktif danışmanlar için</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Sınırsız lead</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> AI skorlama</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> WhatsApp taslağı</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Not & hatırlatıcı</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Star className="w-4 h-4 text-[#F5A623] fill-[#F5A623]" /> Sesli not</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Günlük özet</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Durum & timeline</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#2A2D35]"><X className="w-4 h-4 text-[#2A2D35]" /> İstatistikler & raporlar</li>
                </ul>
                
                <button 
                  disabled={loading || ['pro', 'proplus'].includes(user?.plan)} 
                  onClick={() => handlePayment('pro')}
                  className={`w-full py-2.5 text-center text-[13px] font-medium rounded-[6px] transition-colors ${['pro', 'proplus'].includes(user?.plan) ? 'bg-[#2A2D35] text-[#7C8090] cursor-not-allowed' : 'bg-[#F5A623] text-[#0A0B0D] hover:bg-[#d9921e]'}`}
                >
                  {['pro', 'proplus'].includes(user?.plan) ? 'Mevcut Plan' : (loading ? 'Yönlendiriliyor...' : "Pro'ya Geç")}
                </button>
                <p className="text-center text-[11px] text-[#7C8090] mt-3">14 gün ücretsiz dene — kredi kartı gerekmez</p>
              </div>

              {/* PRO+ CARD */}
              <div className="bg-[#16181D] border border-[#2A2D35] rounded-[10px] p-8 flex flex-col">
                <h3 className="text-[14px] font-medium text-[#3B82F6] mb-4">Pro+</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-[36px] font-medium text-[#F1F2F4]">{isYearly ? '2.490 ₺' : '249 ₺'}</span>
                  <span className="text-[14px] text-[#7C8090] ml-1">{isYearly ? '/yıl' : '/ay'}</span>
                </div>
                <p className="text-[11px] text-[#7C8090] mb-1">{isYearly ? '2 ay bedava avantajı ile' : 'Yıllık ödemede 2.490 ₺'}</p>
                <p className="text-[12px] text-[#7C8090] mb-8">Performansını ölçmek isteyenler için</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Tüm Pro özellikleri</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Star className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6]" /> İstatistik & raporlar</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Star className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6]" /> Ofis analitik paneli</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Portföy–lead eşleştirme</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> CSV export</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Öncelikli destek</li>
                </ul>
                
                <button 
                  disabled={loading || user?.plan === 'proplus'} 
                  onClick={() => handlePayment('proplus')}
                  className={`w-full py-2.5 text-center text-[13px] font-medium rounded-[6px] transition-colors border ${user?.plan === 'proplus' ? 'bg-[#2A2D35] border-[#2A2D35] text-[#7C8090] cursor-not-allowed' : 'border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10'}`}
                >
                  {user?.plan === 'proplus' ? 'Mevcut Plan' : (loading ? 'Yönlendiriliyor...' : "Pro+'ya Geç")}
                </button>
              </div>

              {/* KURUMSAL CARD */}
              <div className="bg-[#16181D] border border-[#2A2D35] rounded-[10px] p-8 flex flex-col">
                <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-4">Kurumsal</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-[36px] font-medium text-[#F1F2F4]">Özel</span>
                </div>
                <p className="text-[11px] text-[#7C8090] mb-1 opacity-0 pointer-events-none select-none">Boşluk</p>
                <p className="text-[12px] text-[#7C8090] mb-8">Kendi sistemine entegre etmek isteyen brokerlar için</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Sınırsız Danışman Hesabı</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Özel API & CRM Entegrasyonu</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> WhatsApp Business API Bağlantısı</li>
                  <li className="flex items-center gap-2 text-[13px] text-[#F1F2F4]"><Check className="w-4 h-4 text-[#10B981]" /> Özel Eğitilmiş Yapay Zeka Modeliniz</li>
                </ul>
                
                <a 
                  href="https://wa.me/905555555555?text=Merhaba,%20Emlak%20Asistanı%20Kurumsal%20plan%20hakkında%20bilgi%20almak%20istiyorum." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 text-center text-[13px] font-medium text-[#F1F2F4] border border-[#2A2D35] rounded-[6px] hover:bg-[#1E2028] transition-colors block"
                >
                  Satışla İletişime Geç
                </a>
              </div>

            </div>

            {/* Compare Table */}
            <div className="mb-16">
              <button 
                onClick={() => setShowCompare(!showCompare)}
                className="w-full flex items-center justify-center gap-2 py-4 border-t border-b border-[#2A2D35] text-[#F1F2F4] text-[14px] font-medium hover:bg-[#16181D] transition-colors"
              >
                Tüm özellikleri karşılaştır
                {showCompare ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showCompare && (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2A2D35]">
                        <th className="py-4 px-4 text-[#7C8090] font-medium text-[13px]">Özellik</th>
                        <th className="py-4 px-4 text-[#7C8090] font-medium text-[13px] text-center">Ücretsiz</th>
                        <th className="py-4 px-4 text-[#F5A623] font-medium text-[13px] text-center bg-[#1A1200] rounded-t-[8px]">Pro</th>
                        <th className="py-4 px-4 text-[#3B82F6] font-medium text-[13px] text-center">Pro+</th>
                        <th className="py-4 px-4 text-[#F1F2F4] font-medium text-[13px] text-center">Kurumsal</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] text-[#F1F2F4]">
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">Lead limiti</td>
                        <td className="py-3 px-4 text-center">20/ay</td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]">Sınırsız</td>
                        <td className="py-3 px-4 text-center">Sınırsız</td>
                        <td className="py-3 px-4 text-center text-[#10B981]">Sınırsız (API)</td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">AI skorlama</td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">WhatsApp taslağı</td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">Durum takibi</td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">Sesli not</td>
                        <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">Not & hatırlatıcı</td>
                        <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">Günlük özet</td>
                        <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">İstatistikler</td>
                        <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">Ofis analitik</td>
                        <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">CSV export</td>
                        <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center bg-[#1A1200]"><X className="w-4 h-4 text-[#2A2D35] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                        <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-[#10B981] mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2A2D35] hover:bg-[#1E2028] transition-colors">
                        <td className="py-3 px-4">Destek</td>
                        <td className="py-3 px-4 text-center">Email</td>
                        <td className="py-3 px-4 text-center bg-[#1A1200] rounded-b-[8px]">Email</td>
                        <td className="py-3 px-4 text-center">Öncelikli</td>
                        <td className="py-3 px-4 text-center">Özel Hesap Yöneticisi</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Beta Promo Code */}
            <div className="bg-[#16181D] border border-[#2A2D35] border-l-[3px] border-l-[#F5A623] p-6 rounded-[8px] mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[20px]">🎁</span>
                  <h3 className="text-[15px] font-medium text-[#F1F2F4]">Beta Erken Erişim</h3>
                </div>
                <p className="text-[13px] text-[#7C8090]">Erken erişim kodunuzu girerek Pro+ avantajlarından ücretsiz yararlanın.</p>
                {success && <div className="mt-3 p-2 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[12px] font-medium rounded-[6px] inline-block">{success}</div>}
                {error && <div className="mt-3 p-2 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[12px] rounded-[6px] inline-block">{error}</div>}
              </div>
              
              <div className="w-full md:w-auto">
                <form onSubmit={handleUpgrade} className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Kodu girin..." 
                    className="flex-1 md:w-[200px] bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none uppercase font-mono text-[#F1F2F4] placeholder-[#7C8090]"
                    value={betaCode}
                    onChange={(e) => setBetaCode(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#F5A623] text-[#0A0B0D] px-4 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#d9921e] transition-colors disabled:opacity-50"
                  >
                    Uygula
                  </button>
                </form>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="mb-24">
              <h2 className="text-[20px] font-medium text-[#F1F2F4] mb-6 text-center">Sıkça Sorulan Sorular</h2>
              <div className="space-y-3 max-w-[800px] mx-auto">
                {faqs.map((faq, idx) => (
                  <div 
                    key={idx} 
                    className={`border border-[#2A2D35] rounded-[8px] overflow-hidden transition-colors ${openFaq === idx ? 'bg-[#1E2028]' : 'bg-[#16181D]'}`}
                  >
                    <button 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                    >
                      <span className="text-[14px] font-medium text-[#F1F2F4]">{faq.q}</span>
                      {openFaq === idx ? (
                        <span className="text-[#7C8090] text-[20px] leading-none">−</span>
                      ) : (
                        <span className="text-[#7C8090] text-[20px] leading-none">+</span>
                      )}
                    </button>
                    {openFaq === idx && (
                      <div className="px-6 pb-4 text-[13px] text-[#7C8090]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Banner */}
          <div className="bg-[#0F1012] border-t border-[#2A2D35] py-8 px-4 text-center mt-auto">
            <p className="text-[14px] text-[#F1F2F4] inline-block mr-4">
              Hâlâ kararsız mısınız? 14 gün ücretsiz deneyin — kaybedecek bir şeyiniz yok.
            </p>
            <button className="text-[14px] text-[#F5A623] font-medium hover:underline inline-flex items-center gap-1 mt-3 md:mt-0">
              Ücretsiz Başla <span>→</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Plans;
