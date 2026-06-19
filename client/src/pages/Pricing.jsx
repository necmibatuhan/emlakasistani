import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleStart = () => {
    navigate('/register?plan=pro');
  };

  const faqs = [
    {
      question: "Deneme bittikten sonra ne olur?",
      answer: "Bildirim gönderilir, verilerin korunur. Kredi kartı bilgisi girmediğiniz için otomatik ödeme çekilmez."
    },
    {
      question: "İptal etmek zor mu?",
      answer: "Kesinlikle hayır. Profil ayarlarınızdan tek tıkla aboneliğinizi dilediğiniz zaman iptal edebilirsiniz."
    },
    {
      question: "Verilerimi taşıyabilir miyim?",
      answer: "Evet, tüm müşteri ve notlarınızı istediğiniz zaman CSV olarak bilgisayarınıza indirebilirsiniz."
    },
    {
      question: "Fatura alabilir miyim?",
      answer: "Evet, ödemeniz başarıyla gerçekleştiğinde e-faturanız kayıtlı e-posta adresinize otomatik olarak gönderilir."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0D] font-sans selection:bg-[#10B981]/30">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-20 flex items-center px-6 lg:px-12 z-10 border-b border-[#1E2028]/50 bg-[#0A0B0D]/80 backdrop-blur-md">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#8E929C]">
            <Link to="/#ozellikler" className="hover:text-[#F1F2F4] transition-colors">Özellikler</Link>
            <Link to="/#nasil-calisir" className="hover:text-[#F1F2F4] transition-colors">Nasıl Çalışır</Link>
            <Link to="/pricing" className="text-[#F1F2F4]">Fiyatlandırma</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[14px] font-medium text-[#F1F2F4] hover:text-[#10B981] transition-colors hidden sm:block">Giriş Yap</Link>
            <Link to="/register" className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors shadow-lg shadow-[#10B981]/20">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        
        {isExpired && (
          <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-start gap-3 animate-in slide-in-from-top-4">
            <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
            <div>
              <h3 className="font-bold text-[15px] mb-1">14 Günlük Ücretsiz Deneme Süreniz Doldu</h3>
              <p className="text-[14px]">Sistemi kullanmaya devam edebilmek için bir plan seçerek üyeliğinizi başlatmanız gerekmektedir.</p>
            </div>
          </div>
        )}

        {/* Header Text */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[13px] font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            Basit, Şeffaf ve Adil
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#F1F2F4] tracking-tight mb-6 leading-tight">
            Sadeliği tercih ediyoruz.<br/>Tek plan, her şey dahil.
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#8E929C] leading-relaxed">
            Emlak ofisiniz için ihtiyacınız olan tüm özellikler tek pakette. Karmaşık hesaplamalara, sürpriz ücretlere son.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-150 fade-in">
          <button 
            onClick={() => setIsAnnual(false)}
            className={`text-[15px] font-medium transition-colors ${!isAnnual ? 'text-[#F1F2F4]' : 'text-[#8E929C] hover:text-[#F1F2F4]'}`}
          >
            Aylık Ödeme
          </button>
          
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-8 rounded-full bg-[#1C1E24] border border-[#2A2D35] flex items-center px-1 transition-colors hover:border-[#3F4350]"
          >
            <div className={`w-6 h-6 rounded-full bg-[#10B981] transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
          
          <button 
            onClick={() => setIsAnnual(true)}
            className={`text-[15px] font-medium transition-colors flex items-center gap-2 ${isAnnual ? 'text-[#F1F2F4]' : 'text-[#8E929C] hover:text-[#F1F2F4]'}`}
          >
            Yıllık Ödeme
            <span className="px-2 py-0.5 rounded-[4px] bg-[#10B981]/10 text-[#10B981] text-[11px] uppercase tracking-wider font-bold">2 Ay Bedava</span>
          </button>
        </div>

        {/* Pricing Card */}
        <div className="w-full max-w-md bg-[#1C1E24] border border-[#2A2D35] rounded-3xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-500 delay-300 fade-in shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none"></div>
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-[#F1F2F4] mb-2">Kapora Pro</h2>
            <p className="text-[#8E929C] text-[14px] mb-6">Tüm gelişmiş özelliklere sınırsız erişim</p>
            
            <div className="mb-8">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold text-[#F1F2F4]">₺{isAnnual ? '699' : '899'}</span>
                <span className="text-[#8E929C] text-[16px] mb-1.5">/ ay</span>
              </div>
              {isAnnual && (
                <p className="text-[13px] text-[#10B981] mt-2 font-medium">Yıllık ₺8.388 faturalandırılır (₺2.388 kâr)</p>
              )}
            </div>

            <button 
              onClick={handleStart}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-4 rounded-xl font-bold text-[16px] transition-all shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/40 active:scale-[0.98] mb-4"
            >
              14 Gün Ücretsiz Başla
            </button>
            <p className="text-center text-[12px] text-[#8E929C] mb-8">
              Kredi kartı gerekmez. İstediğin zaman iptal.
            </p>

            <div className="space-y-4">
              <h4 className="text-[13px] font-semibold text-[#F1F2F4] uppercase tracking-wider mb-4">Neler Dahil?</h4>
              
              <ul className="space-y-3">
                {[
                  "Sınırsız müşteri ekleme",
                  "AI öncelik skorlaması — her gün güncellenir",
                  "\"Günün Öncelikleri\" dashboard widget'ı",
                  "WhatsApp mesaj şablonları",
                  "Hızlı mobil müşteri ekleme",
                  "Portföy yönetimi",
                  "Skor gerekçeleri ve AI notları",
                  "7/24 WhatsApp destek"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-[#10B981] shrink-0">check_circle</span>
                    <span className="text-[14px] text-[#D1D5DB]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[14px] text-[#8E929C] animate-in fade-in duration-1000 delay-500">
          Excel ve deftere kıyasla: <strong className="text-[#F1F2F4]">Ayda ortalama 2 kapanan işlem farkı</strong> yaratır.
        </div>

        {/* FAQs */}
        <div className="w-full max-w-3xl mt-32">
          <h3 className="text-2xl font-bold text-[#F1F2F4] mb-10 text-center">Sıkça Sorulan Sorular</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#1C1E24] border border-[#2A2D35] rounded-2xl p-6">
                <h4 className="text-[15px] font-bold text-[#F1F2F4] mb-2">{faq.question}</h4>
                <p className="text-[14px] text-[#8E929C] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[#1E2028] text-center text-[13px] text-[#5B5F6C]">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} Kapora AI. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
