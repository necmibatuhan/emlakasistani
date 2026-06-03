import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';

const MOCK_LEADS = [
  {
    name: "Ayşe Kaya",
    score: "8/10",
    req: "Kadıköy 3+1",
    action: "BUGÜN ARA",
    color: "#EF4444",
    bg: "bg-[#EF4444]",
    text: "text-[#EF4444]",
    border: "border-[#EF4444]",
    msg: "\"Merhaba Ayşe Hanım, Kadıköy'deki 3+1 deniz manzaralı dairemiz tam aradığınız özelliklerde. Yarın 14:00'te görmek ister misiniz?\""
  },
  {
    name: "Mehmet Yılmaz",
    score: "6/10",
    req: "Beşiktaş 2+1",
    action: "TAKİBE AL",
    color: "#F5A623",
    bg: "bg-[#F5A623]",
    text: "text-[#F5A623]",
    border: "border-[#F5A623]",
    msg: "\"Merhaba Mehmet Bey, Beşiktaş'ta aradığınız bütçeye uygun yeni bir 2+1 portföyümüz oldu. Detayları iletmemi ister misiniz?\""
  },
  {
    name: "Zeynep Demir",
    score: "9/10",
    req: "Şişli Ofis",
    action: "HEMEN ARA",
    color: "#EF4444",
    bg: "bg-[#EF4444]",
    text: "text-[#EF4444]",
    border: "border-[#EF4444]",
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
    <div className="min-h-screen bg-[#0A0B0D] text-[#F1F2F4] font-sans selection:bg-[#F5A623] selection:text-[#0A0B0D] overflow-x-hidden">
      
      {/* BÖLÜM 1 — NAVİGASYON */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0B0D]/80 backdrop-blur-md border-b border-[#1E2025]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-[#1E2025] flex items-center justify-center rounded-[4px]">
              <span className="text-[#F1F2F4] text-[16px] font-bold tracking-tight">EA</span>
            </div>
            <span className="text-[14px] font-medium tracking-wide">Kapora</span>
          </div>
          
          {/* Right Nav */}
          <div className="flex items-center space-x-6">
            <a href="#fiyatlar" className="text-[#7C8090] hover:text-[#F1F2F4] text-[13px] font-medium transition-colors">Fiyatlar</a>
            <Link to="/auth" className="text-[#7C8090] hover:text-[#F1F2F4] text-[13px] font-medium transition-colors">Giriş Yap</Link>
            <Link to="/auth" className="bg-[#F5A623] hover:bg-[#d9921e] text-[#0A0B0D] text-[13px] font-medium px-4 py-1.5 rounded-[6px] transition-colors">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* BÖLÜM 2 — HERO */}
      <section className="pt-40 pb-24 px-6 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center relative">
        {/* Sol Metin */}
        <div className="w-full lg:w-1/2 lg:pr-12 xl:pl-[80px] z-10 flex flex-col items-start">
          
          <div className="bg-[#1E2025] px-3 py-1.5 rounded-full flex items-center space-x-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
            <span className="text-[#F1F2F4] text-[12px] font-medium">Türkiye'de 180.000 emlak danışmanı</span>
          </div>

          <h1 className="text-[52px] font-medium leading-[1.15] tracking-tight text-[#F1F2F4] mb-2">
            Daha Fazla Portföy.<br/>
            Daha Fazla Satış.<br/>
            <span className="text-[#7C8090]">Daha Fazla Komisyon.</span>
          </h1>

          <p className="text-[16px] font-normal text-[#7C8090] mt-6 mb-10 max-w-[440px] leading-relaxed">
            WhatsApp, yapay zekâ ve otomatik takip sistemi ile hiçbir fırsatı kaçırmayın.
          </p>

          <div className="flex items-center space-x-6 mb-8">
            <Link to="/auth" className="bg-[#F5A623] hover:bg-[#d9921e] text-[#0A0B0D] text-[14px] font-medium px-6 py-2.5 rounded-[6px] transition-colors">
              Ücretsiz Başla
            </Link>
            <button onClick={() => setIsVideoModalOpen(true)} className="text-[#7C8090] hover:text-[#F1F2F4] text-[14px] font-medium transition-colors flex items-center space-x-2">
              <Play size={16} className="text-[#F5A623]" />
              <span>Demo izle</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-[#7C8090]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>İstanbul · Ankara · İzmir'de aktif danışmanlar kullanıyor</span>
          </div>

        </div>

        {/* Sağ Görsel (UI Snippet) */}
        <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative perspective-[1000px] hidden md:block">
          <div 
            className="w-full max-w-[500px] ml-auto bg-[#16181D] border border-[#1E2025] rounded-[10px] shadow-2xl relative overflow-hidden"
            style={{ transform: 'perspective(1000px) rotateY(-8deg) rotateX(2deg)' }}
          >
            {/* Header Mock */}
            <div className="h-10 border-b border-[#1E2025] flex items-center px-4 space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D35]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D35]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D35]" />
            </div>
            
            <div className="p-5 space-y-4">
              {/* Lead Card Mock */}
              <div key={mockLead.name} className="bg-[#0A0B0D] border border-[#1E2025] rounded-md p-3 flex items-center justify-between animate-fade-in-up">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${mockLead.bg}`} />
                  <span className="text-[13px] font-medium text-[#F1F2F4]">{mockLead.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`font-mono text-[12px] ${mockLead.text}`}>{mockLead.score}</span>
                  <span className="text-[12px] text-[#7C8090]">{mockLead.req}</span>
                  <span className={`${mockLead.text} bg-[#16181D] border border-[#1E2025] text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider`}>{mockLead.action}</span>
                </div>
              </div>
              
              {/* WhatsApp Draft Mock */}
              <div key={mockLead.msg} className="bg-[#0A0B0D] border border-[#1E2025] border-l-2 border-l-[#25D366] rounded-md p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <p className="text-[12px] text-[#7C8090] font-mono leading-relaxed">
                  {mockLead.msg}
                </p>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-3 right-4 flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] text-[#10B981] font-medium uppercase tracking-wider">Canlı</span>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 3 — SOSYAL KANIT ŞERİDİ */}
      <section className="w-full bg-[#0F1012] border-y border-[#1E2025] py-4 overflow-hidden relative">
        {/* Gradient mask for smooth fade on edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0F1012] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0F1012] to-transparent z-10" />
        
        <div className="flex w-[200%] animate-marquee">
          <div className="flex w-1/2 justify-around items-center space-x-16">
            <div className="text-[12px] font-normal text-[#7C8090] whitespace-nowrap">
              <span className="text-[#F5A623]">"</span>Artık sabah kimi arayacağımı biliyorum.<span className="text-[#F5A623]">"</span> <span className="mx-2">·</span> Kadıköy, İstanbul
            </div>
            <div className="text-[12px] font-normal text-[#7C8090] whitespace-nowrap">
              <span className="text-[#F5A623]">"</span>Sıcak leadleri kaçırmıyorum.<span className="text-[#F5A623]">"</span> <span className="mx-2">·</span> Çankaya, Ankara
            </div>
            <div className="text-[12px] font-normal text-[#7C8090] whitespace-nowrap">
              <span className="text-[#F5A623]">"</span>WhatsApp taslağı tek tıkla hazır.<span className="text-[#F5A623]">"</span> <span className="mx-2">·</span> Konak, İzmir
            </div>
            <div className="text-[12px] font-normal text-[#7C8090] whitespace-nowrap">
              <span className="text-[#F5A623]">"</span>Haftada 3-4 saat kazandım.<span className="text-[#F5A623]">"</span> <span className="mx-2">·</span> Nilüfer, Bursa
            </div>
          </div>
          <div className="flex w-1/2 justify-around items-center space-x-16">
            <div className="text-[12px] font-normal text-[#7C8090] whitespace-nowrap">
              <span className="text-[#F5A623]">"</span>Artık sabah kimi arayacağımı biliyorum.<span className="text-[#F5A623]">"</span> <span className="mx-2">·</span> Kadıköy, İstanbul
            </div>
            <div className="text-[12px] font-normal text-[#7C8090] whitespace-nowrap">
              <span className="text-[#F5A623]">"</span>Sıcak leadleri kaçırmıyorum.<span className="text-[#F5A623]">"</span> <span className="mx-2">·</span> Çankaya, Ankara
            </div>
            <div className="text-[12px] font-normal text-[#7C8090] whitespace-nowrap">
              <span className="text-[#F5A623]">"</span>WhatsApp taslağı tek tıkla hazır.<span className="text-[#F5A623]">"</span> <span className="mx-2">·</span> Konak, İzmir
            </div>
            <div className="text-[12px] font-normal text-[#7C8090] whitespace-nowrap">
              <span className="text-[#F5A623]">"</span>Haftada 3-4 saat kazandım.<span className="text-[#F5A623]">"</span> <span className="mx-2">·</span> Nilüfer, Bursa
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 4 — NASIL ÇALIŞIR */}
      <section className="py-24 px-6 max-w-[800px] mx-auto">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#7C8090] mb-12">Nasıl çalışır</h2>
        
        <div className="flex flex-col space-y-6">
          <div className="flex items-start pb-6 border-b border-[#1E2025]">
            <div className="w-16 font-mono text-[13px] text-[#2A2D35] font-bold">01</div>
            <div className="w-48 text-[15px] font-medium text-[#F1F2F4]">WhatsApp'ı bağla</div>
            <div className="flex-1 text-[13px] text-[#7C8090]">Gelen mesajlar anında sisteme düşer, bütçe ve aciliyet AI tarafından analiz edilir.</div>
          </div>
          
          <div className="flex items-start pb-6 border-b border-[#1E2025]">
            <div className="w-16 font-mono text-[13px] text-[#2A2D35] font-bold">02</div>
            <div className="w-48 text-[15px] font-medium text-[#F1F2F4]">Asistanla konuş</div>
            <div className="flex-1 text-[13px] text-[#7C8090]">Arama sonrası telefona 30 saniye konuş. Yapay zeka senin yerine CRM'e verileri işlesin.</div>
          </div>
          
          <div className="flex items-start pb-6 border-b border-[#1E2025]">
            <div className="w-16 font-mono text-[13px] text-[#2A2D35] font-bold">03</div>
            <div className="w-48 text-[15px] font-medium text-[#F1F2F4]">Portföy eşleşsin</div>
            <div className="flex-1 text-[13px] text-[#7C8090]">Müşterinin istekleri (bütçe, konum, m2) havuzunuzdaki portföylerle saniyeler içinde eşleştirilir.</div>
          </div>

          <div className="flex items-start pb-6 border-b border-[#1E2025]">
            <div className="w-16 font-mono text-[13px] text-[#2A2D35] font-bold">04</div>
            <div className="w-48 text-[15px] font-medium text-[#F1F2F4]">Takip et & Kapat</div>
            <div className="flex-1 text-[13px] text-[#7C8090]">Hazır taslaklarla müşteriye ulaş, otomatik hatırlatıcılarla hiçbir takibi kaçırma.</div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 5 — ÖZELLİKLER */}
      <section className="py-12 px-6 max-w-[1000px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
          
          {/* Sol Büyük Kart */}
          <div className="bg-[#16181D] border border-[#1E2025] rounded-[8px] p-7 flex flex-col relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F5A623]" />
            <h3 className="text-[16px] font-medium text-[#F1F2F4] mb-2 mt-2">Lead skorlama</h3>
            <p className="text-[14px] text-[#7C8090] mb-8">Her mesaj 3 kritere göre puanlanır: bütçe, aciliyet, ciddiyet.</p>
            
            <div className="space-y-4 mt-auto mb-4">
              <div className="flex items-center text-[12px]">
                <span className="w-20 text-[#7C8090] font-medium">Bütçe</span>
                <div className="flex-1 font-mono tracking-widest text-[#F5A623]">████████░░</div>
                <span className="w-12 text-right font-mono text-[#F1F2F4]">8/10</span>
              </div>
              <div className="flex items-center text-[12px]">
                <span className="w-20 text-[#7C8090] font-medium">Aciliyet</span>
                <div className="flex-1 font-mono tracking-widest text-[#F5A623]">██████████</div>
                <span className="w-12 text-right font-mono text-[#F1F2F4]">10/10</span>
              </div>
              <div className="flex items-center text-[12px]">
                <span className="w-20 text-[#7C8090] font-medium">Ciddiyet</span>
                <div className="flex-1 font-mono tracking-widest text-[#F5A623]">███████░░░</div>
                <span className="w-12 text-right font-mono text-[#F1F2F4]">7/10</span>
              </div>
            </div>
          </div>

          {/* Sağ Kolon (Büyük üst, İki Küçük alt) */}
          <div className="flex flex-col gap-4 h-full">
            
            {/* Sağ Üst */}
            <div className="flex-1 bg-[#16181D] border border-[#1E2025] rounded-[8px] p-6 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-[#25D366]" />
              <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-3 ml-4">Tam Entegre CRM & Portföy</h3>
              <p className="font-mono text-[12px] text-[#7C8090] ml-4 leading-relaxed">
                Tüm mülklerinizi, takımınızı ve performans raporlarınızı tek panelden yönetin. Müşteriniz "Deniz manzaralı daire" yazdığında, AI doğrudan uygun portföyünüzü eşleştirip WhatsApp taslağını oluşturur.
              </p>
            </div>

            {/* Sağ Alt (Yan Yana) */}
            <div className="grid grid-cols-2 gap-4 h-[140px]">
              <div className="bg-[#16181D] border border-[#1E2025] rounded-[8px] p-5 flex flex-col justify-between hover:border-[#4A4E5A] transition-colors">
                <h3 className="text-[13px] font-medium text-[#F1F2F4]">Yapay Zeka Sesli Not</h3>
                <p className="text-[12px] text-[#7C8090]">Görüşmeden çık, 30sn konuş. Klavye kullanmana gerek yok.</p>
              </div>
              <div className="bg-[#16181D] border border-[#1E2025] rounded-[8px] p-5 flex flex-col justify-between hover:border-[#4A4E5A] transition-colors">
                <h3 className="text-[13px] font-medium text-[#F1F2F4]">Otomasyon & Takip</h3>
                <p className="text-[12px] text-[#7C8090]">"Haftaya arayacağım" diyen müşteriyi sistem senin yerine hatırlatır.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* BÖLÜM 6 — FİYATLANDIRMA */}
      <section id="fiyatlar" className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Ücretsiz */}
          <div className="bg-[#16181D] border border-[#1E2025] rounded-[8px] p-8 flex flex-col">
            <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-4">Ücretsiz</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-[32px] font-medium text-[#F1F2F4]">0 ₺</span>
              <span className="text-[13px] text-[#7C8090] ml-1">/ay</span>
            </div>
            <ul className="text-[13px] text-[#7C8090] space-y-3 mb-8 flex-1">
              <li>5 lead / ay</li>
              <li>AI skorlama</li>
              <li>WhatsApp taslağı</li>
            </ul>
            <Link to="/auth" className="w-full py-2.5 text-center text-[13px] font-medium text-[#F1F2F4] border border-[#2A2D35] hover:bg-[#1E2025] rounded-[6px] transition-colors">
              Başla
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-[#1A1600] border border-[#F5A623] rounded-[8px] p-8 flex flex-col relative transform md:-translate-y-4">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#F5A623] text-[#0A0B0D] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
              En popüler
            </div>
            <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-4">Pro</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-[32px] font-medium text-[#F1F2F4]">299 ₺</span>
              <span className="text-[13px] text-[#7C8090] ml-1">/ay</span>
            </div>
            <ul className="text-[13px] text-[#F1F2F4] space-y-3 mb-8 flex-1">
              <li>Sınırsız lead</li>
              <li>Not & Sesli not</li>
              <li>Hatırlatıcı</li>
              <li>Günlük özet</li>
            </ul>
            <Link to="/auth" className="w-full py-2.5 text-center text-[13px] font-medium bg-[#F5A623] text-[#0A0B0D] hover:bg-[#d9921e] rounded-[6px] transition-colors">
              Pro'ya Geç
            </Link>
          </div>

          {/* Pro+ */}
          <div className="bg-[#16181D] border border-[#1E2025] rounded-[8px] p-8 flex flex-col">
            <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-4">Pro+</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-[32px] font-medium text-[#F1F2F4]">599 ₺</span>
              <span className="text-[13px] text-[#7C8090] ml-1">/ay</span>
            </div>
            <ul className="text-[13px] text-[#7C8090] space-y-3 mb-8 flex-1">
              <li>Tüm Pro özellikleri</li>
              <li>İstatistik ve Raporlar</li>
              <li>Timeline takibi</li>
              <li>Öncelikli destek</li>
            </ul>
            <Link to="/auth" className="w-full py-2.5 text-center text-[13px] font-medium text-[#F1F2F4] border border-[#2A2D35] hover:bg-[#1E2025] rounded-[6px] transition-colors">
              Pro+'ya Geç
            </Link>
          </div>

          {/* Kurumsal */}
          <div className="bg-[#16181D] border border-[#1E2025] rounded-[8px] p-8 flex flex-col">
            <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-4">Kurumsal (Enterprise)</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-[32px] font-medium text-[#F1F2F4]">Özel</span>
            </div>
            <ul className="text-[13px] text-[#7C8090] space-y-3 mb-8 flex-1">
              <li>Sınırsız Ofis & Danışman</li>
              <li>Özel API Entegrasyonu</li>
              <li>WhatsApp Business API</li>
              <li>Size Özel Yapay Zeka</li>
            </ul>
            <a href="https://wa.me/905555555555?text=Merhaba,%20Emlak%20Asistanı%20Kurumsal%20plan%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" className="w-full py-2.5 text-center text-[13px] font-medium text-[#F1F2F4] border border-[#2A2D35] hover:bg-[#1E2025] rounded-[6px] transition-colors">
              Satışla İletişime Geç
            </a>
          </div>

        </div>
      </section>

      {/* BÖLÜM 7 — FOOTER */}
      <footer className="border-t border-[#1E2025] py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="text-[12px] text-[#7C8090]">
            © 2026 Kapora
          </div>
          <div className="flex items-center space-x-6 text-[12px] text-[#7C8090]">
            <a href="#" className="hover:text-[#F1F2F4] transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-[#F1F2F4] transition-colors">KVKK</a>
          </div>
        </div>
      </footer>

      {/* VIDEO MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-[#0A0B0D]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#16181D] border border-[#2A2D35] rounded-[10px] w-full max-w-4xl overflow-hidden shadow-2xl relative">
            <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-4 right-4 text-[#7C8090] hover:text-[#F1F2F4] z-10 bg-[#0A0B0D] p-2 rounded-full border border-[#2A2D35] transition-colors">
              <X size={20} />
            </button>
            <div className="aspect-video w-full bg-[#0A0B0D] flex items-center justify-center relative border-b border-[#2A2D35]">
              <div className="text-center p-8">
                <div className="w-16 h-16 border-4 border-[#2A2D35] border-t-[#F5A623] rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-[#F1F2F4] font-medium text-[20px] mb-2">Demo Videosu</h3>
                <p className="text-[#7C8090] text-[14px] max-w-md mx-auto leading-relaxed">
                  Şu an için AI olarak MP4/Video üretme yeteneğim bulunmuyor. Ancak bu alanı, <strong>YouTube</strong>, <strong>Vimeo</strong> veya <strong>Loom</strong> üzerinden kaydettiğiniz kendi demo videonuzu yerleştirmek için kullanabilirsiniz.
                </p>
                <div className="mt-8 bg-[#16181D] border border-[#2A2D35] p-4 rounded-[6px] text-left">
                  <p className="text-[11px] text-[#7C8090] uppercase tracking-wider mb-2 font-bold">Nasıl Eklenir?</p>
                  <code className="text-[#10B981] text-[12px] font-mono">
                    &lt;iframe src="https://www.youtube.com/embed/YOUR_ID" ...&gt;&lt;/iframe&gt;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & PRIVACY NOTICE */}
      <footer className="border-t border-[#2A2D35] bg-[#0A0B0D] py-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#1E2025] rounded-[6px] flex items-center justify-center">
                <span className="text-[#F1F2F4] font-bold text-[14px] tracking-tight">EA</span>
              </div>
              <span className="text-[#F1F2F4] font-semibold tracking-tight text-[18px]">Kapora</span>
            </div>
            <p className="text-[#7C8090] text-[13px] leading-relaxed mb-4">
              <strong className="text-[#F1F2F4] font-medium block mb-1">Veri Gizliliği Bildirimi ("Privacy by Design"):</strong>
              Kapora, KVKK uyumlu altyapısı ile tasarlanmıştır. Verileriniz, anonimleştirme teknolojileri ile korunur. Yapay zeka süreçlerimizde, müşteri bilgileriniz (ad, telefon, e-posta) analiz edilmeden önce maskelenir ve dış sistemlerde veya modellerin eğitiminde asla depolanmaz/kullanılmaz.
            </p>
            <div className="flex items-center space-x-4 text-[13px]">
              <a href="/aydinlatma-metni" className="text-[#F5A623] hover:text-[#FFA000] transition-colors font-medium">Aydınlatma Metni</a>
              <span className="text-[#2A2D35]">•</span>
              <a href="/gizlilik-politikasi" className="text-[#F5A623] hover:text-[#FFA000] transition-colors font-medium">Gizlilik Politikası</a>
            </div>
          </div>
          
          <div className="text-[#7C8090] text-[13px] text-left md:text-right">
            <p>© {new Date().getFullYear()} Kapora.</p>
            <p className="mt-1">Tüm Hakları Saklıdır.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
