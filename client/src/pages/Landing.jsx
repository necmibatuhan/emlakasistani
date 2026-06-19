import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, X, Menu, Sun, Moon, Globe } from 'lucide-react';
import { Logo } from '../components/Logo';
import { BLOG_POSTS } from './BlogList';
import { t } from '../locales/landingTranslations';

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
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('tr');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const curr = t[lang];

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Hardcoded hex check that might break light mode in body
    if (theme === 'light') {
       document.documentElement.style.backgroundColor = '#F8FAFC';
    } else {
       document.documentElement.style.backgroundColor = '#0F172A';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
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
            <Link to="/blog" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">{curr.nav.blog}</Link>
            <a href="#fiyatlar" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">{curr.nav.pricing}</a>
            <Link to="/auth" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">{curr.nav.login}</Link>
            <Link to="/auth" className="bg-primary hover:bg-primary/90 text-on-primary font-body-sm font-medium px-5 py-2 rounded-md transition-colors">
              {curr.nav.startFree}
            </Link>
            <div className="flex items-center gap-2 border-l border-outline-variant pl-6 ml-2">
              <button 
                onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} 
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 p-2 rounded-md bg-surface-container-high border border-outline-variant text-[12px] font-bold tracking-wider"
              >
                <Globe size={16} />
                {lang === 'tr' ? 'EN' : 'TR'}
              </button>
              <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full bg-surface-container-high border border-outline-variant">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
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
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-on-surface font-body-md font-medium transition-colors py-2">{curr.nav.blog}</Link>
            <a href="#fiyatlar" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-on-surface font-body-md font-medium transition-colors py-2">{curr.nav.pricing}</a>
            <div className="flex items-center gap-4 py-2">
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant hover:text-on-surface font-body-md font-medium transition-colors">{curr.nav.login}</Link>
            </div>
            <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary hover:bg-primary/90 text-on-primary font-body-md font-medium px-5 py-3 rounded-md transition-colors text-center mt-2">
              {curr.nav.startFree}
            </Link>
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-outline-variant">
              <button 
                onClick={() => { setLang(lang === 'tr' ? 'en' : 'tr'); setIsMobileMenuOpen(false); }} 
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 p-2 rounded-md bg-surface-container border border-outline-variant text-[12px] font-bold tracking-wider"
              >
                <Globe size={18} />
                {lang === 'tr' ? 'EN' : 'TR'}
              </button>
              <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full bg-surface-container border border-outline-variant">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* BÖLÜM 2 — HERO */}
      <section className="pt-40 pb-24 px-6 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center relative">
        {/* Sol Metin */}
        <div className="w-full lg:w-1/2 lg:pr-12 xl:pl-[80px] z-10 flex flex-col items-start">
          
          <div className="bg-surface-container px-4 py-2 rounded-full flex items-center space-x-2 mb-8 border border-outline-variant">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-on-surface font-label-md font-medium">{curr.hero.stat}</span>
          </div>

          <h1 className="font-display-lg text-[40px] md:text-[48px] lg:text-[56px] font-semibold leading-[1.1] tracking-tight text-on-surface mb-6">
            {curr.hero.title1}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#FDE047] to-primary bg-[length:200%_auto] animate-gradient-x">{curr.hero.title2}</span>
          </h1>

          <p className="font-body-lg text-on-surface-variant mt-4 mb-10 max-w-[480px] leading-relaxed">
            {curr.hero.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 w-full sm:w-auto">
            <Link to="/auth" className="bg-primary hover:bg-[#C2933B] text-on-primary font-label-lg font-medium px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              {curr.hero.increaseCommission}
            </Link>
            <button onClick={() => setIsVideoModalOpen(true)} className="text-on-surface-variant hover:text-on-surface font-label-lg font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto py-2">
              <span className="material-symbols-outlined text-primary text-[20px]">play_circle</span>
              <span>{curr.hero.seeSystem}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 font-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">check_circle</span>
            <span>{curr.hero.saveTime}</span>
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
                <span className="font-label-sm text-[#10B981] tracking-widest">{curr.hero.autopilot}</span>
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
                <span className="material-symbols-outlined text-[16px]">send</span> {curr.flow.autoReplied}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 2.5 — SOCIAL PROOF */}
      <section className="pb-16 px-6 max-w-[1200px] mx-auto border-b border-outline-variant/30">
        <p className="text-center font-body-sm text-on-surface-variant uppercase tracking-widest mb-8">
          Kullandığınız Tüm Araçlarla Tam Uyumlu Çalışır
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
          <div className="flex items-center gap-2 text-on-surface-variant font-display-sm font-bold text-xl"><span className="material-symbols-outlined text-3xl">chat</span> WhatsApp</div>
          <div className="flex items-center gap-2 text-on-surface-variant font-display-sm font-bold text-xl"><span className="material-symbols-outlined text-3xl">calendar_month</span> Google Takvim</div>
          <div className="flex items-center gap-2 text-on-surface-variant font-display-sm font-bold text-xl"><span className="material-symbols-outlined text-3xl">table_view</span> MS Excel</div>
          <div className="flex items-center gap-2 text-on-surface-variant font-display-sm font-bold text-xl"><span className="material-symbols-outlined text-3xl">psychology</span> OpenAI</div>
        </div>
      </section>

      {/* BÖLÜM 3 — SOSYAL KANIT ŞERİDİ */}
      <section className="w-full bg-surface-container-lowest border-y border-outline-variant py-5 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface-container-lowest to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface-container-lowest to-transparent z-10" />
        
        <div className="flex w-[200%] animate-marquee">
          <div className="flex w-1/2 justify-around items-center space-x-16">
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>{curr.socialProof.quote1}<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> {curr.socialProof.loc1}
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>{curr.socialProof.quote2}<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> {curr.socialProof.loc2}
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>{curr.socialProof.quote3}<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> {curr.socialProof.loc3}
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>{curr.socialProof.quote4}<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> {curr.socialProof.loc4}
            </div>
          </div>
          <div className="flex w-1/2 justify-around items-center space-x-16">
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>{curr.socialProof.quote1}<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> {curr.socialProof.loc1}
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>{curr.socialProof.quote2}<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> {curr.socialProof.loc2}
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>{curr.socialProof.quote3}<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> {curr.socialProof.loc3}
            </div>
            <div className="font-body-md text-on-surface-variant whitespace-nowrap">
              <span className="text-primary font-bold">"</span>{curr.socialProof.quote4}<span className="text-primary font-bold">"</span> <span className="mx-2">·</span> {curr.socialProof.loc4}
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 4 — LIVE UI FLOW */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Sol: Adımlar */}
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="font-headline-lg text-[32px] text-on-surface mb-8">{curr.flow.title}</h2>
            
            <div className="relative pl-8 border-l-2 border-surface-container-high space-y-12">
              <div className="relative transition-opacity duration-300" style={{ opacity: activeFlowStep >= 0 ? 1 : 0.4 }}>
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ring-4 ring-background transition-colors duration-500 ${activeFlowStep === 0 ? 'bg-primary shadow-[0_0_15px_rgba(217,167,74,0.5)]' : 'bg-surface-container-highest'}`}></div>
                <h3 className="font-headline-sm text-on-surface mb-2">{curr.flow.step1Title}</h3>
                <p className="font-body-md text-on-surface-variant">{curr.flow.step1Desc}</p>
              </div>

              <div className="relative transition-opacity duration-300" style={{ opacity: activeFlowStep >= 1 ? 1 : 0.4 }}>
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ring-4 ring-background transition-colors duration-500 ${activeFlowStep === 1 ? 'bg-primary shadow-[0_0_15px_rgba(217,167,74,0.5)]' : 'bg-surface-container-highest'}`}></div>
                <h3 className="font-headline-sm text-on-surface mb-2">{curr.flow.step2Title}</h3>
                <p className="font-body-md text-on-surface-variant">{curr.flow.step2Desc}</p>
              </div>

              <div className="relative transition-opacity duration-300" style={{ opacity: activeFlowStep >= 2 ? 1 : 0.4 }}>
                <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full ring-4 ring-background transition-colors duration-500 ${activeFlowStep === 2 ? 'bg-primary shadow-[0_0_15px_rgba(217,167,74,0.5)]' : 'bg-surface-container-highest'}`}></div>
                <h3 className="font-headline-sm text-on-surface mb-2">{curr.flow.step3Title}</h3>
                <p className="font-body-md text-on-surface-variant">{curr.flow.step3Desc}</p>
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
                  <div className="font-headline-sm text-on-surface">{curr.flow.newRequest} {mockLead.name}</div>
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
                    <div className="font-label-sm text-on-surface-variant mb-3 uppercase tracking-wider">{curr.flow.draftReady}</div>
                    <div className="bg-surface-container-highest/30 p-4 rounded-lg border border-outline-variant/30 border-l-4 border-l-primary relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-30"><span className="material-symbols-outlined text-primary">send_to_mobile</span></div>
                      <p className="font-body-sm text-on-surface">
                        "{mockLead.aiReply}"
                      </p>
                    </div>
                    <button className="w-full mt-4 bg-primary hover:bg-primary/90 text-on-primary font-label-md py-2.5 rounded transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,195,0,0.3)]">
                      <span className="material-symbols-outlined text-[18px]">send</span> {curr.flow.sendReply}
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
              {curr.mockup.title}
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-[600px] mx-auto">
              {curr.mockup.desc}
            </p>
          </div>

          <div className="bg-surface-container/60 backdrop-blur-xl border border-outline/50 rounded-2xl shadow-2xl p-6 lg:p-10 relative overflow-hidden">
            {/* Window controls mockup */}
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-outline-variant/50">
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="ml-4 font-label-sm text-on-surface-variant tracking-widest uppercase">
                {curr.mockup.preview}
              </div>
            </div>

            {/* Mockup Tabs */}
            <div className="flex items-center gap-6 mb-6">
              {curr.mockup.tabs.map((tab, idx) => (
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
                        <span className="text-[20px]">🔥</span> {curr.mockup.warRoom.hotTitle}
                      </h3>
                      <span className="bg-status-hot/20 text-status-hot border border-status-hot/30 px-3 py-1 rounded-full font-label-sm">
                        {curr.mockup.warRoom.hotBadge}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-surface-container p-4 rounded-lg border border-outline-variant/30">
                        <div>
                          <div className="font-label-md text-on-surface">Ahmet Yılmaz</div>
                          <div className="font-body-sm text-on-surface-variant">Beşiktaş · 3+1 Satılık</div>
                        </div>
                        <button className="bg-primary/10 text-primary px-4 py-2 rounded-md font-label-sm border border-primary/20">
                          {curr.mockup.warRoom.callNow}
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-surface-container p-4 rounded-lg border border-outline-variant/30">
                        <div>
                          <div className="font-label-md text-on-surface">Pelin K.</div>
                          <div className="font-body-sm text-on-surface-variant">Kadıköy · 15M Bütçe</div>
                        </div>
                        <button className="bg-primary/10 text-primary px-4 py-2 rounded-md font-label-sm border border-primary/20">
                          {curr.mockup.warRoom.callNow}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Panel: Kayıp Riski Olanlar */}
                  <div className="bg-surface-container-high border border-outline-variant/60 rounded-xl p-6 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                      <h3 className="font-headline-sm text-on-surface flex items-center gap-2">
                        <span className="text-[20px]">🚨</span> {curr.mockup.warRoom.riskTitle}
                      </h3>
                      <span className="bg-status-error/20 text-status-error border border-status-error/30 px-3 py-1 rounded-full font-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span> {curr.mockup.warRoom.riskBadge}
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
                          <span className="material-symbols-outlined text-[16px]">chat</span> {curr.mockup.warRoom.sendWa}
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
                        <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">{curr.mockup.attackPlan.lastContact}</span>
                        <span className="text-xl font-bold text-[#EF4444]">8 Gün Önce</span>
                        <span className="text-[12px] font-medium text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded mt-2">%85 Kayıp Riski</span>
                      </div>
                      <div className="bg-surface-container/80 border border-outline/50 rounded-xl p-4 flex flex-col items-start relative overflow-hidden">
                        <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-1">{curr.mockup.attackPlan.commission}</span>
                        <span className="text-xl font-bold text-[#10B981]">₺125.000</span>
                        <span className="text-[12px] font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded mt-2">Yüksek İşlem Hacmi</span>
                      </div>
                   </div>
                   <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-5 relative shadow-inner">
                      <h4 className="text-[12px] font-bold text-primary tracking-wider uppercase mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">psychology</span> {curr.mockup.attackPlan.aiSummaryTitle}
                      </h4>
                      <p className="text-[14px] text-on-surface leading-relaxed font-medium mb-4">
                        "Yatırım amaçlı bakıyor, kredi çekmeyecek, nakdi hazır. Eşinin onayı kritik. 15M bütçe."
                      </p>
                      <div className="bg-surface-container-highest/50 rounded-lg p-3 border border-outline-variant/50">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">{curr.mockup.attackPlan.nextAction}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-on-surface font-semibold">Dün fiyat sormuştu, dönüş bekliyor.</span>
                          <button className="bg-primary text-on-primary text-[12px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-md">
                            <span className="material-symbols-outlined text-[14px]">send</span> {curr.mockup.attackPlan.sendWa}
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
                        <span className="text-[16px]">🎯</span> {curr.mockup.matches.title}
                      </h4>
                      <p className="text-[13px] text-on-surface-variant mt-1">{curr.mockup.matches.desc}</p>
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
                        <button className="border border-outline-variant text-on-surface px-2 py-1 rounded text-[11px]">{curr.mockup.matches.view}</button>
                      </div>
                      <div className="flex items-center justify-between text-[13px] bg-surface-container p-3 rounded-lg border border-outline-variant/30">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="font-bold text-on-surface">Kadıköy Merkez</span>
                        </div>
                        <span className="font-mono text-on-surface">9.8M ₺</span>
                        <span className="text-[#10B981] text-[12px] font-medium w-[90px]">✓ Bütçe uygun</span>
                        <button className="border border-outline-variant text-on-surface px-2 py-1 rounded text-[11px]">{curr.mockup.matches.view}</button>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 6 — FİYATLANDIRMA */}
      <section id="fiyatlar" className="pt-24 pb-32 px-6 bg-surface-container-lowest relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="text-center mb-12 relative z-10">
          <h2 className="font-display-lg text-[32px] md:text-[40px] text-on-surface font-medium mb-3">{curr.pricing.title}</h2>
          <p className="text-on-surface-variant font-body-md mb-1">{curr.pricing.desc1}</p>
          <p className="text-on-surface-variant font-body-md mb-8">{curr.pricing.desc2}</p>

          {/* Toggle */}
          <div className="inline-flex items-center bg-surface-container-high rounded-lg p-1 mx-auto">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-label-sm transition-colors ${billingCycle === 'monthly' ? 'bg-[#FDE047] text-[#1e1b4b] shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {curr.pricing.monthly}
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-label-sm transition-colors ${billingCycle === 'yearly' ? 'bg-[#surface-container-highest] text-on-surface shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {curr.pricing.yearly}
            </button>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          {/* Feature Item Renderer */}
          {(() => {
            const renderFeature = (feat, idx) => {
              let icon = null;
              if (feat.type === 'check') icon = <span className="material-symbols-outlined text-[18px] text-[#10B981] shrink-0">check</span>;
              else if (feat.type === 'cross') icon = <span className="material-symbols-outlined text-[18px] text-[#52525B] shrink-0">close</span>;
              else if (feat.type === 'star-yellow') icon = <span className="material-symbols-outlined text-[18px] text-[#FDE047] shrink-0">star</span>;
              else if (feat.type === 'star-blue') icon = <span className="material-symbols-outlined text-[18px] text-[#3B82F6] shrink-0">star</span>;
              
              return (
                <li key={idx} className={`flex items-start gap-3 font-body-sm ${feat.type === 'cross' ? 'text-zinc-500' : 'text-zinc-100'}`}>
                  {icon}
                  <span>{feat.text}</span>
                </li>
              );
            };

            return (
              <>
                {/* Pro (En Popüler) */}
                <div className="bg-[#18181B] border border-[#FDE047] rounded-2xl p-6 flex flex-col relative transform md:-translate-y-4 scale-105 shadow-[0_0_40px_rgba(253,224,71,0.15)] transition-all duration-300 ease-out hover:md:-translate-y-6 hover:-translate-y-2 hover:scale-[1.07] hover:shadow-[0_0_50px_rgba(253,224,71,0.3)] hover:z-20">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FDE047] text-[#18181B] font-label-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full text-[11px]">
                    {curr.pricing.pro.badge}
                  </div>
                  <h3 className="font-headline-sm text-[#FDE047] mb-6 mt-2">{curr.pricing.pro.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="font-display-lg font-bold text-zinc-100">{billingCycle === 'monthly' ? curr.pricing.pro.priceMonthly : curr.pricing.pro.priceYearly}</span>
                    <span className="font-body-sm text-zinc-400 ml-1">{curr.pricing.pro.period}</span>
                  </div>
                  <div className="font-body-sm text-zinc-400 mb-1">{curr.pricing.pro.yearlyText} {curr.pricing.pro.priceYearly}</div>
                  <div className="font-body-sm text-zinc-400 mb-8">{curr.pricing.pro.desc}</div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {curr.pricing.pro.features.map(renderFeature)}
                  </ul>
                  
                  <Link to="/auth" className="w-full py-3 text-center font-label-md text-[#18181B] bg-[#FDE047] hover:bg-[#EAB308] rounded-lg transition-all mb-4">
                    {curr.pricing.pro.btn}
                  </Link>
                  <div className="text-center font-body-xs text-zinc-500">
                    {curr.pricing.pro.footer}
                  </div>
                </div>

                {/* Pro+ */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 flex flex-col transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-[#3B82F6]/50 hover:z-20 relative">
                  <h3 className="font-headline-sm text-[#3B82F6] mb-6">{curr.pricing.proPlus.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="font-display-lg font-bold text-zinc-100">{billingCycle === 'monthly' ? curr.pricing.proPlus.priceMonthly : curr.pricing.proPlus.priceYearly}</span>
                    <span className="font-body-sm text-zinc-400 ml-1">{curr.pricing.proPlus.period}</span>
                  </div>
                  <div className="font-body-sm text-zinc-400 mb-1">{curr.pricing.proPlus.yearlyText} {curr.pricing.proPlus.priceYearly}</div>
                  <div className="font-body-sm text-zinc-400 mb-8 h-10">{curr.pricing.proPlus.desc}</div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {curr.pricing.proPlus.features.map(renderFeature)}
                  </ul>
                  
                  <Link to="/auth" className="w-full py-3 text-center font-label-md text-[#60A5FA] bg-[#1E3A8A]/30 hover:bg-[#1E3A8A]/50 border border-[#1E3A8A]/50 rounded-lg transition-all">
                    {curr.pricing.proPlus.btn}
                  </Link>
                </div>

                {/* Kurumsal */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 flex flex-col transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-[#E5E7EB]/50 hover:z-20 relative">
                  <h3 className="font-headline-sm text-[#E5E7EB] mb-6">{curr.pricing.enterprise.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="font-display-lg font-bold text-zinc-100">{curr.pricing.enterprise.price}</span>
                  </div>
                  <div className="font-body-sm text-zinc-400 mb-1">&nbsp;</div>
                  <div className="font-body-sm text-zinc-400 mb-8 h-10">{curr.pricing.enterprise.desc}</div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {curr.pricing.enterprise.features.map(renderFeature)}
                  </ul>
                  
                  <a href="https://wa.me/905555555555?text=Merhaba" target="_blank" rel="noopener noreferrer" className="w-full py-3 text-center font-label-md text-zinc-100 bg-[#27272A] hover:bg-[#3F3F46] rounded-lg transition-all">
                    {curr.pricing.enterprise.btn}
                  </a>
                </div>
              </>
            );
          })()}

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
              {curr.blog.title}
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-[600px] mx-auto">
              {curr.blog.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <div key={post.id} className="bg-surface-container border border-outline-variant rounded-xl p-6 flex flex-col hover:border-primary/50 transition-colors shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-on-surface-variant">{post.readTime} {curr.blog.minRead}</span>
                </div>
                <h3 className="font-headline-md text-on-surface text-xl mb-3 leading-snug">
                  {post.title}
                </h3>
                <p className="font-body-sm text-on-surface-variant mb-6 flex-1 line-clamp-4">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.slug}`} className="text-primary font-label-md flex items-center gap-1 hover:gap-2 transition-all">
                  {curr.blog.read} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
              {curr.footer.desc}
            </p>
            <div className="flex items-center space-x-4 font-body-sm">
              <a href="/aydinlatma-metni" className="text-primary hover:text-primary/80 transition-colors font-medium">{curr.footer.clarification}</a>
              <span className="text-outline-variant">•</span>
              <a href="/gizlilik-politikasi" className="text-primary hover:text-primary/80 transition-colors font-medium">{curr.footer.privacy}</a>
            </div>
          </div>
          
          <div className="font-body-sm text-on-surface-variant text-left md:text-right">
            <p>© {new Date().getFullYear()} Kapora.</p>
            <p className="mt-1">{curr.footer.rights}</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
