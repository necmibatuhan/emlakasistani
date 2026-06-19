import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleStart = (plan) => {
    navigate(`/register?plan=${plan}`);
  };

  const handleContact = () => {
    window.location.href = 'mailto:info@kapora.online';
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
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-[#FDE047]/30 pb-24">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-20 flex items-center px-6 lg:px-12 z-10 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-400">
            <Link to="/#ozellikler" className="hover:text-white transition-colors">Özellikler</Link>
            <Link to="/#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır</Link>
            <Link to="/pricing" className="text-white">Fiyatlandırma</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[14px] font-medium text-white hover:text-[#FDE047] transition-colors hidden sm:block">Giriş Yap</Link>
            <Link to="/register" className="bg-[#FDE047] hover:bg-[#FACC15] text-slate-900 px-5 py-2.5 rounded-full text-[14px] font-bold transition-colors shadow-lg shadow-[#FDE047]/20">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        
        {isExpired && (
          <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-start gap-3 animate-in slide-in-from-top-4">
            <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
            <div>
              <h3 className="font-bold text-[15px] mb-1">14 Günlük Ücretsiz Deneme Süreniz Doldu</h3>
              <p className="text-[14px]">Sistemi kullanmaya devam edebilmek için bir plan seçerek üyeliğinizi başlatmanız gerekmektedir.</p>
            </div>
          </div>
        )}

        {/* Toggle */}
        <div className="bg-[#1e293b] p-1.5 rounded-lg flex items-center mb-16 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <button 
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2 rounded-md text-[14px] font-bold transition-all ${!isAnnual ? 'bg-[#FDE047] text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Aylık
          </button>
          
          <button 
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2 rounded-md text-[14px] font-bold transition-all ${isAnnual ? 'bg-[#FDE047] text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Yıllık — %17 indirim
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl animate-in zoom-in-95 duration-500 delay-300 fade-in">
          
          {/* Card 1: Pro */}
          <div className="relative bg-[#18181b] border-2 border-[#FDE047] rounded-3xl p-8 flex flex-col shadow-[0_0_40px_-15px_rgba(253,224,71,0.2)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FDE047] text-slate-900 px-4 py-1 rounded-full text-[12px] font-bold tracking-widest uppercase">
              En Popüler
            </div>
            
            <h2 className="text-[#FDE047] font-medium text-lg mb-6">Pro</h2>
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">{isAnnual ? '2.990 ₺' : '299 ₺'}</span>
              <span className="text-slate-400 text-sm ml-1">{isAnnual ? '/yıl' : '/ay'}</span>
            </div>
            
            <div className="h-6 mb-4">
              {isAnnual && <p className="text-slate-400 text-[13px]">Yıllık ödemede 2.990 ₺</p>}
            </div>
            
            <p className="text-slate-400 text-[14px] mb-8 leading-relaxed h-16">
              Sisteme tam entegre olan ve sıcak müşteri veritabanını kaybetmek istemeyen danışmanlar için.
            </p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { text: "Sınırsız lead", type: "check" },
                { text: "AI skorlama", type: "check" },
                { text: "WhatsApp taslağı", type: "check" },
                { text: "Not & hatırlatıcı", type: "check" },
                { text: "Sesli not", type: "star" },
                { text: "Günlük özet", type: "check" },
                { text: "Durum & timeline", type: "check" },
                { text: "İstatistikler & raporlar", type: "cross" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  {item.type === 'check' && <span className="material-symbols-outlined text-[#22c55e] text-[20px]">check</span>}
                  {item.type === 'star' && <span className="material-symbols-outlined text-[#FDE047] text-[20px]">star</span>}
                  {item.type === 'cross' && <span className="material-symbols-outlined text-slate-600 text-[20px]">close</span>}
                  <span className={`text-[14px] ${item.type === 'cross' ? 'text-slate-600' : 'text-slate-300'}`}>{item.text}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => handleStart('pro')}
              className="w-full bg-[#FDE047] hover:bg-[#FACC15] text-slate-900 py-3.5 rounded-xl font-bold text-[15px] transition-all mb-4"
            >
              Pro'ya Geç
            </button>
            <p className="text-center text-[12px] text-slate-500">
              14 gün ücretsiz dene — kredi kartı gerekmez
            </p>
          </div>

          {/* Card 2: Pro+ */}
          <div className="relative bg-[#18181b] border border-white/10 rounded-3xl p-8 flex flex-col mt-4 md:mt-0">
            <h2 className="text-[#3b82f6] font-medium text-lg mb-6">Pro+</h2>
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">{isAnnual ? '3.490 ₺' : '349 ₺'}</span>
              <span className="text-slate-400 text-sm ml-1">{isAnnual ? '/yıl' : '/ay'}</span>
            </div>
            
            <div className="h-6 mb-4">
              {isAnnual && <p className="text-slate-400 text-[13px]">Yıllık ödemede 3.490 ₺</p>}
            </div>
            
            <p className="text-slate-400 text-[14px] mb-8 leading-relaxed h-16">
              Performansını ölçmek isteyenler için
            </p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { text: "Tüm Pro özellikleri", type: "check" },
                { text: "İstatistik & raporlar", type: "star-blue" },
                { text: "Ofis analitik paneli", type: "star-blue" },
                { text: "Portföy-lead eşleştirme", type: "check" },
                { text: "CSV export", type: "check" },
                { text: "Öncelikli destek", type: "check" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  {item.type === 'check' && <span className="material-symbols-outlined text-[#22c55e] text-[20px]">check</span>}
                  {item.type === 'star-blue' && <span className="material-symbols-outlined text-[#3b82f6] text-[20px]">star</span>}
                  <span className="text-[14px] text-slate-300">{item.text}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => handleStart('pro_plus')}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white py-3.5 rounded-xl font-bold text-[15px] transition-all"
            >
              Pro+'ya Geç
            </button>
          </div>

          {/* Card 3: Kurumsal */}
          <div className="relative bg-[#18181b] border border-white/10 rounded-3xl p-8 flex flex-col mt-4 md:mt-0">
            <h2 className="text-slate-400 font-medium text-lg mb-6">Kurumsal</h2>
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">Özel</span>
            </div>
            
            <div className="h-6 mb-4"></div>
            
            <p className="text-slate-400 text-[14px] mb-8 leading-relaxed h-16">
              Kendi sistemine entegre etmek isteyen brokerlar için
            </p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { text: "Sınırsız Danışman Hesabı", type: "check" },
                { text: "Özel API & CRM Entegrasyonu", type: "check" },
                { text: "WhatsApp Business API Bağlantısı", type: "check" },
                { text: "Özel Eğitilmiş Yapay Zeka Modeliniz", type: "check" }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#22c55e] text-[20px] shrink-0 mt-0.5">check</span>
                  <span className="text-[14px] text-slate-300">{item.text}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={handleContact}
              className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-white py-3.5 rounded-xl font-bold text-[15px] transition-all"
            >
              Satışla İletişime Geç
            </button>
          </div>

        </div>

        {/* FAQs */}
        <div className="w-full max-w-3xl mt-32">
          <h3 className="text-2xl font-bold text-white mb-10 text-center">Sıkça Sorulan Sorular</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#18181b] border border-white/5 rounded-2xl p-6">
                <h4 className="text-[15px] font-bold text-white mb-2">{faq.question}</h4>
                <p className="text-[14px] text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-[13px] text-slate-500 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} Kapora AI. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
