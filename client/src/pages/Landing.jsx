import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, X, Menu } from 'lucide-react';
import { Logo } from '../components/Logo';
import { BLOG_POSTS } from './BlogList';

const MOCK_LEADS = [
  {
    name: "Zeynep D.",
    time: "Bugün, 14:30",
    matchScore: "%92 Eşleşme",
    incomingMsg: "Merhaba, Şişli'deki ofis ilanınız için yazıyorum. 100m2 civarı, bütçemiz 40.000 TL.",
    tags: [
      { text: "Şişli", style: "bg-surface-container-high text-on-surface-variant border-outline-variant" },
      { text: "Ofis", style: "bg-surface-container-high text-on-surface-variant border-outline-variant" },
      { text: "Bütçe: 40k", style: "bg-status-warm/10 text-status-warm border-status-warm/30" }
    ],
    aiReply: "Zeynep Hanım merhaba, Şişli bölgesinde tam aradığınız özelliklere uygun 110m2'lik yeni bir portföyümüz mevcut. Size detaylı sunum dosyasını iletiyorum."
  },
  {
    name: "Mehmet Y.",
    time: "Bugün, 15:45",
    matchScore: "%98 Eşleşme",
    incomingMsg: "Kadıköy veya Ataşehir'de satılık 3+1 arıyorum. Bütçem 4.5M TL, krediye uygun olmalı.",
    tags: [
      { text: "Satılık 3+1", style: "bg-surface-container-high text-on-surface-variant border-outline-variant" },
      { text: "Kadıköy", style: "bg-surface-container-high text-on-surface-variant border-outline-variant" },
      { text: "Bütçe: 4.5M", style: "bg-primary/10 text-primary border-primary/30" }
    ],
    aiReply: "Mehmet Bey merhaba, Kadıköy'de krediye uygun, yeni binada 3+1 portföyümüz az önce eklendi. Hafta sonu görmek ister misiniz?"
  },
  {
    name: "Ayşe K.",
    time: "Dün, 18:20",
    matchScore: "%85 Eşleşme",
    incomingMsg: "İzmir Bornova'da eşyalı kiralık 1+1 bakıyoruz. Acil taşınmamız lazım, bütçe 15.000 TL.",
    tags: [
      { text: "Kiralık 1+1", style: "bg-surface-container-high text-on-surface-variant border-outline-variant" },
      { text: "Bornova", style: "bg-surface-container-high text-on-surface-variant border-outline-variant" },
      { text: "Çok Acil", style: "bg-status-hot/10 text-status-hot border-status-hot/30" }
    ],
    aiReply: "Ayşe Hanım merhaba, Bornova'da hemen taşınmaya hazır eşyalı 1+1 portföyümüz var. Müsaitseniz yarın sabah gösterebilirim."
  }
];

const Landing = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMockIndex, setActiveMockIndex] = React.useState(0);
  const [activeFlowStep, setActiveFlowStep] = React.useState(0);
  const [activeMockupView, setActiveMockupView] = React.useState(0); // 0: Savaş Odası, 1: Saldırı Planı, 2: Eşleşme

  React.useEffect(() => {
    const mockupInterval = setInterval(() => {
      setActiveMockupView((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(mockupInterval);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlowStep((prevStep) => {
        if (prevStep === 2) {
          setActiveMockIndex((prevMock) => (prevMock + 1) % MOCK_LEADS.length);
          return 0;
        }
        return prevStep + 1;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const mockLead = MOCK_LEADS[activeMockIndex];

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans selection:bg-primary selection:text-on-primary overflow-x-hidden">
      
      {/* BÖLÜM 1 — NAVİGASYON */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/blog" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">Blog</Link>
            <a href="#fiyatlar" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">Fiyatlar</a>
            <Link to="/auth" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">Giriş Yap</Link>
            <Link to="/auth" className="bg-primary hover:bg-primary/90 text-on-primary font-body-sm font-medium px-5 py-2 rounded-md transition-colors">
              Ücretsiz Başla
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-on-surface-variant hover:text-on-surface p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex flex-col space-y-4">
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-on-surface font-body-md font-medium transition-colors py-2">Blog</Link>
            <a href="#fiyatlar" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-on-surface font-body-md font-medium transition-colors py-2">Fiyatlar</a>
            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-on-surface font-body-md font-medium transition-colors py-2">Giriş Yap</Link>
            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary hover:bg-primary/90 text-on-primary font-body-md font-medium px-5 py-3 rounded-md transition-colors text-center mt-2">
              Ücretsiz Başla
            </Link>
          </div>
        )}
      </nav>

      {/* BÖLÜM 2 — HERO */}
      <section className="pt-40 pb-24 px-6 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center relative">
        {/* Sol Metin */}
        <div className="w-full lg:w-1/2 lg:pr-12 xl:pl-[80px] z-10 flex flex-col items-start">
          
          <div className="bg-surface-container px-4 py-2 rounded-full flex items-center space-x-2 mb-8 border border-outline-variant">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-on-surface font-label-md font-medium">Türkiye'de 180.000 emlak danışmanı</span>
          </div>

          <h1 className="font-display-lg text-[40px] md:text-[48px] lg:text-[56px] font-semibold leading-[1.1] tracking-tight text-on-surface mb-6">
            Daha Fazla<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#FDE047] to-primary bg-[length:200%_auto] animate-gradient-x">Portföy.</span><br/>
            Daha Fazla<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#FDE047] to-primary bg-[length:200%_auto] animate-gradient-x">Satış.</span><br/>
            Daha Fazla<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#FDE047] to-primary bg-[length:200%_auto] animate-gradient-x">Komisyon.</span>
          </h1>

          <p className="font-body-lg text-on-surface-variant mt-4 mb-10 max-w-[480px] leading-relaxed">
            Manuel veri girişiyle vakit kaybetmeyin. Kapora, gün içinde aldığınız sesli notları analiz ederek ajandanızı düzenleyen, potansiyel alıcıları portföyünüzle eşleştiren ve bugün odaklanmanız gereken en sıcak fırsatları listeleyen akıllı satış asistanınızdır.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 w-full sm:w-auto">
            <Link to="/auth" className="bg-primary hover:bg-[#C2933B] text-on-primary font-label-lg font-medium px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              Komisyonunu Artır
            </Link>
            <button onClick={() => setIsVideoModalOpen(true)} className="text-on-surface-variant hover:text-on-surface font-label-lg font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto py-2">
              <span className="material-symbols-outlined text-primary text-[20px]">play_circle</span>
              <span>Sistemi Gör</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 font-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-[#10B981]">event</span>
            <span>Günde 3 saat tasarruf eden binlerce danışman</span>
          </div>

        </div>

        {/* Sağ Görsel (UI Snippet) */}
        <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative perspective-[1000px] hidden md:block">
          <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full"></div>
          <div 
            className="w-full max-w-[520px] ml-auto bg-surface-container/60 backdrop-blur-2xl border border-outline/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            style={{ transform: 'perspective(1200px) rotateY(-5deg) rotateX(2deg)' }}
          >
            {/* Header Mock */}
            <div className="h-14 border-b border-outline/30 flex items-center justify-between px-6 bg-surface-container-low/40">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-outline-variant/60" />
                <div className="w-3 h-3 rounded-full bg-outline-variant/60" />
                <div className="w-3 h-3 rounded-full bg-outline-variant/60" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]" />
                <span className="font-label-sm text-[#10B981] tracking-widest">OTOPİLOT AKTİF</span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* WhatsApp Message Incoming */}
              <div key={`hero-msg-${mockLead.name}`} className="flex gap-4 items-start animate-fade-in-up">
                <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                </div>
                <div className="bg-surface-container-highest/40 border border-outline/50 rounded-2xl rounded-tl-sm p-4 text-on-surface-variant font-body-sm shadow-sm relative">
                  "{mockLead.incomingMsg}"
                </div>
              </div>

              {/* Processing Step */}
              <div key={`hero-ai-${mockLead.name}`} className="flex gap-4 items-start animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,195,0,0.2)]">
                  <span className="material-symbols-outlined text-primary text-[20px]">home_work</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="text-primary font-label-sm tracking-wider uppercase">Portföy Eşleşmesi Bulundu</div>
                  <div className="flex gap-2">
                    {mockLead.tags.map((tag, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded text-[12px] border ${tag.style}`}>{tag.text}</span>
                    ))}
                  </div>
                  
                  {/* Automated Reply */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl rounded-tr-sm p-4 relative mt-2">
                    <div className="absolute top-2 right-2 text-[10px] text-primary/60 font-mono">0.4sn</div>
                    <p className="text-on-surface font-body-sm leading-relaxed">
                      "{mockLead.aiReply}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="border-t border-outline/30 p-4 bg-surface-container-low/60 flex justify-end">
              <button className="bg-primary text-on-primary font-label-sm px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-[16px]">send</span> Otomatik Yanıtlandı
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 3 — SOSYAL KANIT ŞERİDİ */}
      <section className="w-full bg-surface-container-lowest border-y border-outline-variant py-5 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface-container-lowest to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface-container-lowest to-transparent z-10" />
        
        <div className="flex w-[200%] animate-marquee">
          <div className="flex w-1/2 justify-around items-center space-x-16">
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>Artık sabah kimi arayacağımı biliyorum.<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> Kadıköy, İstanbul
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>Sıcak leadleri kaçırmıyorum.<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> Çankaya, Ankara
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>WhatsApp taslağı tek tıkla hazır.<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> Konak, İzmir
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>Haftada 3-4 saat kazandım.<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> Nilüfer, Bursa
            </div>
          </div>
          <div className="flex w-1/2 justify-around items-center space-x-16">
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>Artık sabah kimi arayacağımı biliyorum.<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> Kadıköy, İstanbul
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>Sıcak leadleri kaçırmıyorum.<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> Çankaya, Ankara
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>WhatsApp taslağı tek tıkla hazır.<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> Konak, İzmir
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>Haftada 3-4 saat kazandım.<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> Nilüfer, Bursa
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 4 — LIVE UI FLOW */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Sol: Adımlar */}
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="font-headline-lg text-[32px] text-on-surface mb-8">Sesli Asistan ve Dijital Sekreter ile Hız Kazanın</h2>
            
            <div className="relative pl-8 border-l-2 border-surface-container-high space-y-12">
              <div className="relative transition-opacity duration-300" style={{ opacity: activeFlowStep >= 0 ? 1 : 0.4 }}>
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ring-4 ring-background transition-colors duration-500 ${activeFlowStep === 0 ? 'bg-primary shadow-[0_0_15px_rgba(217,167,74,0.5)]' : 'bg-surface-container-highest'}`}></div>
                <h3 className="font-headline-sm text-on-surface mb-2">1. Sesli Not Bırakın</h3>
                <p className="font-body-md text-on-surface-variant">Sahadayken sadece konuşun. Sistem müşteri kriterlerini (bütçe, bölge, aciliyet) saniyeler içinde fişler ve ajandanıza işler.</p>
              </div>

              <div className="relative transition-opacity duration-300" style={{ opacity: activeFlowStep >= 1 ? 1 : 0.4 }}>
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ring-4 ring-background transition-colors duration-500 ${activeFlowStep === 1 ? 'bg-primary shadow-[0_0_15px_rgba(217,167,74,0.5)]' : 'bg-surface-container-highest'}`}></div>
                <h3 className="font-headline-sm text-on-surface mb-2">2. Akıllı Satış Koçu ile Eşleştirin</h3>
                <p className="font-body-md text-on-surface-variant">Sistem, müşteri talebine uyan en karlı portföyleri veri tabanınızdan otomatik bulur ve komisyon ihtimalini hesaplar.</p>
              </div>

              <div className="relative transition-opacity duration-300" style={{ opacity: activeFlowStep >= 2 ? 1 : 0.4 }}>
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ring-4 ring-background transition-colors duration-500 ${activeFlowStep === 2 ? 'bg-primary shadow-[0_0_15px_rgba(217,167,74,0.5)]' : 'bg-surface-container-highest'}`}></div>
                <h3 className="font-headline-sm text-on-surface mb-2">3. Tek Tıkla Sunum Gönderin</h3>
                <p className="font-body-md text-on-surface-variant">Eşleşen portföylerin profesyonel WhatsApp sunum taslağı hazır. Sadece gönder tuşuna basarak müşteriye ulaşın.</p>
              </div>
            </div>
          </div>

          {/* Sağ: Interactive / Glass Mockup */}
          <div className="w-full md:w-1/2 relative mt-12 md:mt-0">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="panel p-6 relative z-10 border border-outline-variant/50 shadow-2xl backdrop-blur-sm bg-surface-container/90">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/50">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#25D366]">chat</span>
                </div>
                <div>
                  <div className="font-headline-sm text-on-surface">Yeni Talep: {mockLead.name}</div>
                  <div className="font-label-sm text-on-surface-variant">{mockLead.time}</div>
                </div>
                <div className="ml-auto px-3 py-1 rounded-full bg-primary/20 text-primary font-label-sm border border-primary/30 transition-all duration-500">
                  {mockLead.matchScore}
                </div>
              </div>
              
              <div key={`flow-${mockLead.name}`} className="space-y-4">
                <div className="bg-surface-container-highest/50 p-4 rounded-lg rounded-tl-none border border-outline-variant/30 max-w-[85%] animate-fade-in-up">
                  <p className="font-body-sm text-on-surface-variant">
                    "{mockLead.incomingMsg}"
                  </p>
                </div>
                
                {activeFlowStep >= 1 && (
                  <div className="flex flex-wrap gap-2 mt-4 animate-fade-in-up">
                    {mockLead.tags.map((tag, i) => (
                      <span key={i} className={`px-2 py-1 rounded font-mono text-[12px] border ${tag.style}`}>{tag.text}</span>
                    ))}
                  </div>
                )}

                {activeFlowStep >= 2 && (
                  <div className="mt-6 pt-4 border-t border-outline-variant/50 animate-fade-in-up">
                    <div className="font-label-sm text-on-surface-variant mb-3 uppercase tracking-wider">Taslak Mesajınız Hazır</div>
                    <div className="bg-surface-container-highest/30 p-4 rounded-lg border border-outline-variant/30 border-l-4 border-l-primary relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-30"><span className="material-symbols-outlined text-primary">send_to_mobile</span></div>
                      <p className="font-body-sm text-on-surface">
                        "{mockLead.aiReply}"
                      </p>
                    </div>
                    <button className="w-full mt-4 bg-primary hover:bg-primary/90 text-on-primary font-label-md py-2.5 rounded transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,195,0,0.3)]">
                      <span className="material-symbols-outlined text-[18px]">send</span> Yanıtı Gönder
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 5 — DASHBOARD MOCKUP */}
      <section className="py-24 px-6 bg-surface-container-lowest relative border-t border-outline-variant">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display-md text-[36px] lg:text-[42px] font-semibold text-on-surface mb-4">
              İçeride Sizi Neler Bekliyor?
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-[600px] mx-auto">
              Karmaşık Excel tablolarını unutun. Her şey tek bir ekranda, satışa dönmeye hazır şekilde sizi bekliyor.
            </p>
          </div>

          <div className="bg-surface-container/60 backdrop-blur-xl border border-outline/50 rounded-2xl shadow-2xl p-6 lg:p-10 relative overflow-hidden">
            {/* Window controls mockup */}
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-outline-variant/50">
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="ml-4 font-label-sm text-on-surface-variant tracking-widest uppercase">
                Panel Önizlemesi
              </div>
            </div>

            {/* Mockup Tabs */}
            <div className="flex items-center gap-6 mb-6">
              {['Savaş Odası', 'Saldırı Planı', 'Eşleşmeler'].map((tab, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveMockupView(idx)}
                  className={`font-label-sm uppercase tracking-wider pb-2 border-b-2 transition-all ${activeMockupView === idx ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative min-h-[350px]">
              {/* View 0: Savaş Odası */}
              <div className={`transition-opacity duration-500 absolute inset-0 ${activeMockupView === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  {/* Sol Panel: Bugün Aranacaklar */}
                  <div className="bg-surface-container-high border border-outline-variant/60 rounded-xl p-6 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                      <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
                        <span className="text-[20px]">🔥</span> Bugün Aranacaklar
                      </h3>
                      <span className="bg-status-hot/20 text-status-hot border border-status-hot/30 px-3 py-1 rounded-full font-label-sm">
                        3 Aktif Müşteri Eşleşti
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-surface-container p-4 rounded-lg border border-outline-variant/30">
                        <div>
                          <div className="font-label-md text-on-surface">Ahmet Yılmaz</div>
                          <div className="font-body-sm text-on-surface-variant">Beşiktaş · 3+1 Satılık</div>
                        </div>
                        <button className="bg-primary/10 text-primary px-4 py-2 rounded-md font-label-sm border border-primary/20">
                          Hemen Ara
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-surface-container p-4 rounded-lg border border-outline-variant/30">
                        <div>
                          <div className="font-label-md text-on-surface">Pelin K.</div>
                          <div className="font-body-sm text-on-surface-variant">Kadıköy · 15M Bütçe</div>
                        </div>
                        <button className="bg-primary/10 text-primary px-4 py-2 rounded-md font-label-sm border border-primary/20">
                          Hemen Ara
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Panel: Kayıp Riski Olanlar */}
                  <div className="bg-surface-container-high border border-outline-variant/60 rounded-xl p-6 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                      <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
                        <span className="text-[20px]">🚨</span> Kayıp Riski Olanlar
                      </h3>
                      <span className="bg-status-error/20 text-status-error border border-status-error/30 px-3 py-1 rounded-full font-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span> Dikkat
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col bg-surface-container p-4 rounded-lg border border-outline-variant/30 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-label-md text-on-surface">Cem E.</div>
                          <div className="font-label-sm text-status-error">14 gündür aranmadı</div>
                        </div>
                        <div className="font-body-sm text-on-surface-variant mb-3">Geçen ay Ataşehir ofis ilanını sormuştu.</div>
                        <button className="w-full bg-surface-container-highest text-on-surface py-2 rounded font-label-sm flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">chat</span> WhatsApp Mesajı Yolla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* View 1: Saldırı Planı */}
              <div className={`transition-opacity duration-500 absolute inset-0 ${activeMockupView === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                <div className="bg-surface-container-high border border-outline-variant/60 rounded-xl p-6 h-full flex flex-col gap-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container/80 border border-outline/50 rounded-xl p-4 flex flex-col items-start relative overflow-hidden">
                        <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">Son Temas & Risk</span>
                        <span className="text-xl font-bold text-[#EF4444]">8 Gün Önce</span>
                        <span className="text-[12px] font-medium text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded mt-2">%85 Kayıp Riski</span>
                      </div>
                      <div className="bg-surface-container/80 border border-outline/50 rounded-xl p-4 flex flex-col items-start relative overflow-hidden">
                        <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">Masadaki Komisyon</span>
                        <span className="text-xl font-bold text-[#10B981]">₺125.000</span>
                        <span className="text-[12px] font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded mt-2">Yüksek İşlem Hacmi</span>
                      </div>
                   </div>
                   <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-5 relative shadow-inner">
                      <h4 className="text-[12px] font-bold text-primary tracking-wider uppercase mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">psychology</span> AI Satış Koçu Özeti
                      </h4>
                      <p className="text-[14px] text-on-surface leading-relaxed font-medium mb-4">
                        "Yatırım amaçlı bakıyor, kredi çekmeyecek, nakdi hazır. Eşinin onayı kritik. 15M bütçe."
                      </p>
                      <div className="bg-surface-container-highest/50 rounded-lg p-3 border border-outline-variant/50">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Sonraki En İyi Aksiyon</span>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-on-surface font-semibold">Dün fiyat sormuştu, dönüş bekliyor.</span>
                          <button className="bg-primary text-on-primary text-[12px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-md">
                            <span className="material-symbols-outlined text-[14px]">send</span> WhatsApp At
                          </button>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* View 2: Eşleşmeler */}
              <div className={`transition-opacity duration-500 absolute inset-0 ${activeMockupView === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                 <div className="bg-surface-container-high border border-outline-variant/60 rounded-xl p-6 h-full flex flex-col gap-4">
                    <div>
                      <h4 className="text-[13px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                        <span className="text-[16px]">🎯</span> Algoritmik Eşleşmeler
                      </h4>
                      <p className="text-[13px] text-on-surface-variant mt-1">Bu müşteriye uygun 2 portföy bulundu.</p>
                    </div>
                    <div className="h-[1px] w-full bg-outline-variant/50" />
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[13px] bg-surface-container p-3 rounded-lg border border-outline-variant/30">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="font-bold text-on-surface">Acıbadem 3+1</span>
                        </div>
                        <span className="font-mono text-on-surface">11.5M ₺</span>
                        <span className="text-[#F5A623] text-[12px] font-medium w-[90px]">Bütçeye yakın</span>
                        <button className="border border-outline-variant text-on-surface px-2 py-1 rounded text-[11px]">Gör →</button>
                      </div>
                      <div className="flex items-center justify-between text-[13px] bg-surface-container p-3 rounded-lg border border-outline-variant/30">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="font-bold text-on-surface">Kadıköy Merkez</span>
                        </div>
                        <span className="font-mono text-on-surface">9.8M ₺</span>
                        <span className="text-[#10B981] text-[12px] font-medium w-[90px]">✓ Bütçe uygun</span>
                        <button className="border border-outline-variant text-on-surface px-2 py-1 rounded text-[11px]">Gör →</button>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 6 — FİYATLANDIRMA */}
      <section id="fiyatlar" className="py-24 px-6 max-w-[1200px] mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="text-center mb-16 relative z-10">
          <h2 className="font-display-lg text-[36px] text-on-surface font-semibold mb-4">Size Uygun Planı Seçin</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-body-lg">Hiçbir gizli ücret yok. İhtiyacınıza göre ölçeklendirin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 group/pricing">
          
          {/* Ücretsiz */}
          <div className="bg-surface-container-low/50 backdrop-blur-lg border border-outline-variant/50 rounded-2xl p-8 flex flex-col shadow-lg transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-primary/40 hover:z-20">
            <h3 className="font-headline-md text-on-surface mb-2 transition-colors duration-300">Ücretsiz</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">Sistemi test etmek için ideal.</p>
            <div className="flex items-baseline mb-8">
              <span className="font-display-md font-bold text-on-surface">0 ₺</span>
              <span className="font-body-sm text-on-surface-variant ml-1">/ay</span>
            </div>
            <ul className="font-body-sm text-on-surface-variant space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span> Ayda 5 Lead Analizi</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span> Temel AI Skorlama</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span> Manuel WhatsApp Taslakları</li>
            </ul>
            <Link to="/auth" className="w-full py-3 text-center font-label-md text-on-surface border border-outline hover:border-primary hover:text-primary hover:bg-surface-container rounded-xl transition-all">
              Hemen Başla
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-surface-container border border-primary rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,195,0,0.15)] ring-1 ring-primary/20 backdrop-blur-xl transition-all duration-300 ease-out hover:md:-translate-y-6 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,195,0,0.3)] hover:z-20">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary font-label-sm uppercase font-bold tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,195,0,0.5)]">
              En Popüler
            </div>
            <h3 className="font-headline-md text-primary mb-2 mt-2">Pro</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">Aktif danışmanlar için eksiksiz otopilot.</p>
            <div className="flex items-baseline mb-8">
              <span className="font-display-md font-bold text-on-surface">299 ₺</span>
              <span className="font-body-sm text-on-surface-variant ml-1">/ay</span>
            </div>
            <ul className="font-body-sm text-on-surface space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> <strong>Sınırsız</strong> Lead Analizi</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> AI Sesli Not & Otomatik Kayıt</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> Akıllı Hatırlatıcılar & Bildirimler</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span> Portföy Eşleştirme Motoru</li>
            </ul>
            <Link to="/auth" className="w-full py-3 text-center font-label-md bg-primary text-on-primary hover:bg-primary/90 hover:scale-[1.02] rounded-xl transition-all shadow-[0_0_20px_rgba(255,195,0,0.3)]">
              Pro'ya Geç
            </Link>
          </div>

          {/* Pro+ */}
          <div className="bg-surface-container-low/50 backdrop-blur-lg border border-outline-variant/50 rounded-2xl p-8 flex flex-col shadow-lg transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-primary/40 hover:z-20">
            <h3 className="font-headline-md text-on-surface mb-2 transition-colors duration-300">Pro+</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">Yoğun ekipler ve ofis yöneticileri için.</p>
            <div className="flex items-baseline mb-8">
              <span className="font-display-md font-bold text-on-surface">599 ₺</span>
              <span className="font-body-sm text-on-surface-variant ml-1">/ay</span>
            </div>
            <ul className="font-body-sm text-on-surface-variant space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span> Pro planındaki her şey</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span> Gelişmiş İstatistik ve Raporlama</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span> Müşteri Timeline Takibi</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">check</span> 7/24 Öncelikli Destek</li>
            </ul>
            <Link to="/auth" className="w-full py-3 text-center font-label-md text-on-surface border border-outline hover:border-primary hover:text-primary hover:bg-surface-container rounded-xl transition-all">
              Pro+'ya Geç
            </Link>
          </div>

          {/* Kurumsal */}
          <div className="bg-surface-container-low/50 backdrop-blur-lg border border-outline-variant/50 rounded-2xl p-8 flex flex-col shadow-lg transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:border-primary/40 hover:z-20">
            <h3 className="font-headline-md text-on-surface mb-2 transition-colors duration-300">Kurumsal</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">Kendi sistemine entegre etmek isteyen brokerlar için.</p>
            <div className="flex items-baseline mb-8">
              <span className="font-display-md font-bold text-on-surface">Özel</span>
            </div>
            <ul className="font-body-sm text-on-surface-variant space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">domain</span> Sınırsız Danışman Hesabı</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">api</span> Özel API & CRM Entegrasyonu</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">chat</span> WhatsApp Business API Bağlantısı</li>
              <li className="flex items-start gap-3"><span className="material-symbols-outlined text-[18px] text-primary shrink-0">smart_toy</span> Özel Eğitilmiş Yapay Zeka Modeliniz</li>
            </ul>
            <a href="https://wa.me/905555555555?text=Merhaba,%20Emlak%20Asistanı%20Kurumsal%20plan%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" className="w-full py-3 text-center font-label-md text-on-surface border border-outline hover:border-primary hover:text-primary hover:bg-surface-container rounded-xl transition-all">
              Satışla İletişime Geç
            </a>
          </div>

        </div>
      </section>

      {/* VIDEO MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface z-10 bg-background p-2 rounded-full border border-outline-variant transition-colors">
              <X size={20} />
            </button>
            <div className="aspect-video w-full bg-background flex items-center justify-center relative border-b border-outline-variant">
              <video 
                src="/videos/demo.mp4" 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              >
                Tarayıcınız video etiketini desteklemiyor.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* BLOG SECTION */}
      <section className="py-24 px-6 bg-background relative border-t border-outline-variant">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display-md text-[36px] lg:text-[42px] font-semibold text-on-surface mb-4">
              Akıllı Satış Koçundan İpuçları
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-[600px] mx-auto">
              Emlak sektöründe zaman yönetimi, komisyon artırma ve yeni nesil dijital satış taktiklerini keşfedin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <div key={post.id} className="bg-surface-container border border-outline-variant rounded-xl p-6 flex flex-col hover:border-primary/50 transition-colors shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-[13px] text-on-surface-variant">{post.readTime} okuma</span>
                </div>
                <h3 className="font-headline-md text-on-surface text-xl mb-3 leading-snug">
                  {post.title}
                </h3>
                <p className="font-body-sm text-on-surface-variant mb-6 flex-1 line-clamp-4">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.slug}`} className="text-primary font-medium text-sm flex items-center group/link mt-auto">
                  Devamını Oku 
                  <span className="material-symbols-outlined ml-1 text-[18px] group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER & PRIVACY NOTICE */}
      <footer className="border-t border-outline-variant bg-surface-container-lowest py-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl w-full">
            <Logo className="mb-8" />
            <p className="font-body-sm text-on-surface-variant leading-relaxed mb-4 border-t border-outline-variant pt-8">
              Kullanıcı verilerinizin güvenliği Kapora için birinci önceliktir. Aydınlatma Metni ve Gizlilik Politikası'nı aşağıdan inceleyebilirsiniz.
            </p>
            <div className="flex items-center space-x-4 font-body-sm">
              <a href="/aydinlatma-metni" className="text-primary hover:text-primary/80 transition-colors font-medium">Aydınlatma Metni</a>
              <span className="text-outline-variant">•</span>
              <a href="/gizlilik-politikasi" className="text-primary hover:text-primary/80 transition-colors font-medium">Gizlilik Politikası</a>
            </div>
          </div>
          
          <div className="font-body-sm text-on-surface-variant text-left md:text-right">
            <p>© {new Date().getFullYear()} Kapora.</p>
            <p className="mt-1">Tüm Hakları Saklıdır.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
