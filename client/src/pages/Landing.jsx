import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import { Logo } from '../components/Logo';

const MOCK_LEADS = [
  {
    name: "Ayşe Kaya",
    score: "8/10",
    req: "Kadıköy 3+1",
    action: "BUGÜN ARA",
    bg: "bg-error",
    text: "text-error",
    msg: "\"Merhaba Ayşe Hanım, Kadıköy'deki 3+1 deniz manzaralı dairemiz tam aradığınız özelliklerde. Yarın 14:00'te görmek ister misiniz?\""
  },
  {
    name: "Mehmet Yılmaz",
    score: "6/10",
    req: "Beşiktaş 2+1",
    action: "TAKİBE AL",
    bg: "bg-primary",
    text: "text-primary",
    msg: "\"Merhaba Mehmet Bey, Beşiktaş'ta aradığınız bütçeye uygun yeni bir 2+1 portföyümüz oldu. Detayları iletmemi ister misiniz?\""
  },
  {
    name: "Zeynep Demir",
    score: "9/10",
    req: "Şişli Ofis",
    action: "HEMEN ARA",
    bg: "bg-error",
    text: "text-error",
    msg: "\"Zeynep Hanım merhaba, Şişli'de tam aradığınız m2'de plaza katı kiralık portföyümüze eklendi. Öğleden sonra müsaitseniz sunum yapabilirim.\""
  }
];

const Landing = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeMockIndex, setActiveMockIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveMockIndex((prev) => (prev + 1) % MOCK_LEADS.length);
    }, 2000);
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
          
          {/* Right Nav */}
          <div className="flex items-center gap-stack-lg">
            <a href="#fiyatlar" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">Fiyatlar</a>
            <Link to="/auth" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">Giriş Yap</Link>
            <Link to="/auth" className="bg-primary hover:bg-primary/90 text-on-primary font-body-sm font-medium px-5 py-2 rounded-md transition-colors">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* BÖLÜM 2 — HERO */}
      <section className="pt-40 pb-24 px-6 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center relative">
        {/* Sol Metin */}
        <div className="w-full lg:w-1/2 lg:pr-12 xl:pl-[80px] z-10 flex flex-col items-start">
          
          <div className="bg-surface-container px-4 py-2 rounded-full flex items-center space-x-2 mb-8 border border-outline-variant">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-on-surface font-label-md font-medium">Türkiye'de 180.000 emlak danışmanı</span>
          </div>

          <h1 className="font-display-lg text-[48px] lg:text-[56px] font-semibold leading-[1.1] tracking-tight text-on-surface mb-4">
            Daha Fazla Portföy.<br/>
            Daha Fazla Satış.<br/>
            <span className="text-on-surface-variant">Daha Fazla Komisyon.</span>
          </h1>

          <p className="font-body-lg text-on-surface-variant mt-4 mb-10 max-w-[440px] leading-relaxed">
            WhatsApp, yapay zekâ ve otomatik takip sistemi ile hiçbir fırsatı kaçırmayın.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Link to="/auth" className="bg-primary hover:bg-primary/90 text-on-primary font-label-lg font-medium px-6 py-3 rounded-md transition-colors">
              Ücretsiz Başla
            </Link>
            <button onClick={() => setIsVideoModalOpen(true)} className="text-on-surface-variant hover:text-on-surface font-label-lg font-medium transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">play_circle</span>
              <span>Demo izle</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 font-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>
            <span>İstanbul · Ankara · İzmir'de aktif danışmanlar kullanıyor</span>
          </div>

        </div>

        {/* Sağ Görsel (UI Snippet) */}
        <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative perspective-[1000px] hidden md:block">
          <div 
            className="w-full max-w-[500px] ml-auto bg-surface-container-low border border-outline-variant rounded-xl shadow-2xl relative overflow-hidden"
            style={{ transform: 'perspective(1000px) rotateY(-8deg) rotateX(2deg)' }}
          >
            {/* Header Mock */}
            <div className="h-12 border-b border-outline-variant flex items-center px-5 space-x-2 bg-surface-container-lowest">
              <div className="w-3 h-3 rounded-full bg-outline-variant" />
              <div className="w-3 h-3 rounded-full bg-outline-variant" />
              <div className="w-3 h-3 rounded-full bg-outline-variant" />
            </div>
            
            <div className="p-6 space-y-4">
              {/* Lead Card Mock */}
              <div key={mockLead.name} className="bg-surface-container border border-outline-variant rounded-md p-4 flex items-center justify-between animate-fade-in-up">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${mockLead.bg}`} />
                  <span className="font-body-sm font-medium text-on-surface">{mockLead.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`font-mono text-[13px] font-medium ${mockLead.text}`}>{mockLead.score}</span>
                  <span className="font-body-sm text-on-surface-variant">{mockLead.req}</span>
                  <span className={`${mockLead.text} bg-surface-container-highest border border-outline-variant font-label-sm px-2 py-1 rounded uppercase tracking-wider`}>{mockLead.action}</span>
                </div>
              </div>
              
              {/* WhatsApp Draft Mock */}
              <div key={mockLead.msg} className="bg-surface-container border border-outline-variant border-l-2 border-l-[#25D366] rounded-md p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <p className="font-mono text-[13px] text-on-surface-variant leading-relaxed">
                  {mockLead.msg}
                </p>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-3.5 right-5 flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-label-sm text-[#10B981] uppercase tracking-wider">Canlı</span>
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

      {/* BÖLÜM 4 — NASIL ÇALIŞIR */}
      <section className="py-24 px-6 max-w-[800px] mx-auto">
        <h2 className="font-label-lg uppercase tracking-widest text-on-surface-variant mb-12">Nasıl çalışır</h2>
        
        <div className="flex flex-col space-y-6">
          <div className="flex items-start pb-6 border-b border-outline-variant">
            <div className="w-16 font-mono text-[16px] text-primary font-bold">01</div>
            <div className="w-48 font-headline-sm text-on-surface">WhatsApp'ı bağla</div>
            <div className="flex-1 font-body-md text-on-surface-variant">Gelen mesajlar anında sisteme düşer, bütçe ve aciliyet AI tarafından analiz edilir.</div>
          </div>
          
          <div className="flex items-start pb-6 border-b border-outline-variant">
            <div className="w-16 font-mono text-[16px] text-primary font-bold">02</div>
            <div className="w-48 font-headline-sm text-on-surface">Asistanla konuş</div>
            <div className="flex-1 font-body-md text-on-surface-variant">Arama sonrası telefona 30 saniye konuş. Yapay zeka senin yerine CRM'e verileri işlesin.</div>
          </div>
          
          <div className="flex items-start pb-6 border-b border-outline-variant">
            <div className="w-16 font-mono text-[16px] text-primary font-bold">03</div>
            <div className="w-48 font-headline-sm text-on-surface">Portföy eşleşsin</div>
            <div className="flex-1 font-body-md text-on-surface-variant">Müşterinin istekleri (bütçe, konum, m2) havuzunuzdaki portföylerle saniyeler içinde eşleştirilir.</div>
          </div>

          <div className="flex items-start pb-6 border-b border-outline-variant">
            <div className="w-16 font-mono text-[16px] text-primary font-bold">04</div>
            <div className="w-48 font-headline-sm text-on-surface">Takip et & Kapat</div>
            <div className="flex-1 font-body-md text-on-surface-variant">Hazır taslaklarla müşteriye ulaş, otomatik hatırlatıcılarla hiçbir takibi kaçırma.</div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 5 — ÖZELLİKLER */}
      <section className="py-12 px-6 max-w-[1000px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
          
          {/* Sol Büyük Kart */}
          <div className="panel p-8 flex flex-col relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
            <h3 className="font-headline-sm text-on-surface mb-2 mt-2">Lead skorlama</h3>
            <p className="font-body-sm text-on-surface-variant mb-8">Her mesaj 3 kritere göre puanlanır: bütçe, aciliyet, ciddiyet.</p>
            
            <div className="space-y-4 mt-auto mb-4">
              <div className="flex items-center font-body-sm">
                <span className="w-20 text-on-surface-variant font-medium">Bütçe</span>
                <div className="flex-1 font-mono tracking-widest text-primary">████████░░</div>
                <span className="w-12 text-right font-mono text-on-surface">8/10</span>
              </div>
              <div className="flex items-center font-body-sm">
                <span className="w-20 text-on-surface-variant font-medium">Aciliyet</span>
                <div className="flex-1 font-mono tracking-widest text-primary">██████████</div>
                <span className="w-12 text-right font-mono text-on-surface">10/10</span>
              </div>
              <div className="flex items-center font-body-sm">
                <span className="w-20 text-on-surface-variant font-medium">Ciddiyet</span>
                <div className="flex-1 font-mono tracking-widest text-primary">███████░░░</div>
                <span className="w-12 text-right font-mono text-on-surface">7/10</span>
              </div>
            </div>
          </div>

          {/* Sağ Kolon (Büyük üst, İki Küçük alt) */}
          <div className="flex flex-col gap-4 h-full">
            
            {/* Sağ Üst */}
            <div className="flex-1 panel p-6 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-[#25D366]" />
              <h3 className="font-headline-sm text-on-surface mb-3 ml-4">Tam Entegre CRM & Portföy</h3>
              <p className="font-mono text-[13px] text-on-surface-variant ml-4 leading-relaxed">
                Tüm mülklerinizi, takımınızı ve performans raporlarınızı tek panelden yönetin. Müşteriniz "Deniz manzaralı daire" yazdığında, AI doğrudan uygun portföyünüzü eşleştirip WhatsApp taslağını oluşturur.
              </p>
            </div>

            {/* Sağ Alt (Yan Yana) */}
            <div className="grid grid-cols-2 gap-4 h-[140px]">
              <div className="panel p-5 flex flex-col justify-between hover:border-outline transition-colors cursor-pointer">
                <h3 className="font-headline-sm text-on-surface">Yapay Zeka Sesli Not</h3>
                <p className="font-body-sm text-on-surface-variant">Görüşmeden çık, 30sn konuş. Klavye kullanmana gerek yok.</p>
              </div>
              <div className="panel p-5 flex flex-col justify-between hover:border-outline transition-colors cursor-pointer">
                <h3 className="font-headline-sm text-on-surface">Otomasyon & Takip</h3>
                <p className="font-body-sm text-on-surface-variant">"Haftaya arayacağım" diyen müşteriyi sistem senin yerine hatırlatır.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* BÖLÜM 6 — FİYATLANDIRMA */}
      <section id="fiyatlar" className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Ücretsiz */}
          <div className="panel p-8 flex flex-col">
            <h3 className="font-headline-md text-on-surface mb-4">Ücretsiz</h3>
            <div className="flex items-baseline mb-6">
              <span className="font-display-md font-semibold text-on-surface">0 ₺</span>
              <span className="font-body-md text-on-surface-variant ml-1">/ay</span>
            </div>
            <ul className="font-body-md text-on-surface-variant space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> 5 lead / ay</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> AI skorlama</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> WhatsApp taslağı</li>
            </ul>
            <Link to="/auth" className="w-full py-2.5 text-center font-label-md text-on-surface border border-outline-variant hover:bg-surface-container rounded-md transition-colors">
              Başla
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-surface-container border border-primary rounded-xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-lg shadow-primary/10">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary font-label-sm uppercase font-bold tracking-wider px-3 py-1 rounded-full">
              En popüler
            </div>
            <h3 className="font-headline-md text-on-surface mb-4">Pro</h3>
            <div className="flex items-baseline mb-6">
              <span className="font-display-md font-semibold text-on-surface">299 ₺</span>
              <span className="font-body-md text-on-surface-variant ml-1">/ay</span>
            </div>
            <ul className="font-body-md text-on-surface space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Sınırsız lead</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Not & Sesli not</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Hatırlatıcı</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Günlük özet</li>
            </ul>
            <Link to="/auth" className="w-full py-2.5 text-center font-label-md bg-primary text-on-primary hover:bg-primary/90 rounded-md transition-colors">
              Pro'ya Geç
            </Link>
          </div>

          {/* Pro+ */}
          <div className="panel p-8 flex flex-col">
            <h3 className="font-headline-md text-on-surface mb-4">Pro+</h3>
            <div className="flex items-baseline mb-6">
              <span className="font-display-md font-semibold text-on-surface">599 ₺</span>
              <span className="font-body-md text-on-surface-variant ml-1">/ay</span>
            </div>
            <ul className="font-body-md text-on-surface-variant space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Tüm Pro özellikleri</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> İstatistik ve Raporlar</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Timeline takibi</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">check</span> Öncelikli destek</li>
            </ul>
            <Link to="/auth" className="w-full py-2.5 text-center font-label-md text-on-surface border border-outline-variant hover:bg-surface-container rounded-md transition-colors">
              Pro+'ya Geç
            </Link>
          </div>

          {/* Kurumsal */}
          <div className="panel p-8 flex flex-col">
            <h3 className="font-headline-md text-on-surface mb-4">Kurumsal</h3>
            <div className="flex items-baseline mb-6">
              <span className="font-display-md font-semibold text-on-surface">Özel</span>
            </div>
            <ul className="font-body-md text-on-surface-variant space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">domain</span> Sınırsız Danışman</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">api</span> Özel API</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">chat</span> WhatsApp API</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">smart_toy</span> Özel Yapay Zeka</li>
            </ul>
            <a href="https://wa.me/905555555555?text=Merhaba,%20Emlak%20Asistanı%20Kurumsal%20plan%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" className="w-full py-2.5 text-center font-label-md text-on-surface border border-outline-variant hover:bg-surface-container rounded-md transition-colors">
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
              <div className="text-center p-8">
                <div className="w-16 h-16 border-4 border-outline-variant border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="font-headline-lg text-on-surface mb-2">Demo Videosu</h3>
                <p className="font-body-md text-on-surface-variant max-w-md mx-auto leading-relaxed">
                  Bu alana YouTube, Vimeo veya Loom üzerinden kaydettiğiniz kendi ürün demonuzu yerleştirebilirsiniz.
                </p>
                <div className="mt-8 bg-surface-container border border-outline-variant p-4 rounded-md text-left">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Nasıl Eklenir?</p>
                  <code className="text-[#10B981] font-mono text-[13px]">
                    &lt;iframe src="https://www.youtube.com/embed/YOUR_ID" ...&gt;&lt;/iframe&gt;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & PRIVACY NOTICE */}
      <footer className="border-t border-outline-variant bg-surface-container-lowest py-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <Logo className="mb-4" />
            <p className="font-body-sm text-on-surface-variant leading-relaxed mb-4">
              <strong className="text-on-surface font-medium block mb-1">Veri Gizliliği Bildirimi ("Privacy by Design"):</strong>
              Kapora, KVKK uyumlu altyapısı ile tasarlanmıştır. Verileriniz, anonimleştirme teknolojileri ile korunur. Yapay zeka süreçlerimizde, müşteri bilgileriniz (ad, telefon, e-posta) analiz edilmeden önce maskelenir ve dış sistemlerde veya modellerin eğitiminde asla depolanmaz/kullanılmaz.
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
