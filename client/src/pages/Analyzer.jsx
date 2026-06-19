import React, { useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, Sparkles, CheckCircle2, TrendingUp, Share2, Download, Image as ImageIcon, Zap, Activity } from 'lucide-react';
import html2canvas from 'html2canvas';
import ReportTemplate from '../components/ReportTemplate';
import { AuthContext } from '../contexts/AuthContext';

const Analyzer = () => {
  const { user } = useContext(AuthContext);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, analyzing, result
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!url) return;

    setStatus('analyzing');
    setProgress(0);

    // Mock progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('result');
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      // Geçici olarak report container'ı görünür yap
      const el = reportRef.current;
      el.style.display = 'block';
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0A0B0D' });
      const image = canvas.toDataURL('image/jpeg', 0.9);
      
      const link = document.createElement('a');
      link.href = image;
      link.download = 'kapora_ilan_analizi.jpg';
      link.click();
      
      el.style.display = 'none';
      el.style.position = 'static';
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Merhaba,\n\nEv ilanınızı inceledim ve yapay zeka tabanlı "Kapora İlan Analizi" sistemimizden geçirdim.\n\nMevcut İlan Skorunuz: 42/100 (Kayıp Riski Yüksek)\n\nNeden satılmıyor?\n❌ Görsel açı ve aydınlatma yetersiz.\n❌ Açıklama metni alıcıda duygu ve aciliyet yaratmıyor.\n\nEğer portföyünüzü bana emanet ederseniz, Kapora AI teknolojileriyle evinizin "Piyasa Çekicilik Skorunu" 82/100'e çıkarıp %40 daha hızlı satılmasını sağlayabilirim.\n\nDetaylı analiz görselini inceleyebilirsiniz.\nİyi günler dilerim,\n${user?.name || "Kapora Danışmanı"}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex flex-col font-sans selection:bg-[#F5A623] selection:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0A0B0D]/80 backdrop-blur-md border-b border-[#2A2D35]">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#FF8B00] flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
              K
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Kapora <span className="text-[#F5A623]">AI</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto w-full">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] text-sm font-semibold mb-6">
              <Sparkles size={16} /> Gelişmiş İlan Analizi
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#F1F2F4] mb-6 leading-tight">
              Portföy Almanın <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#FF8B00]">En Teknolojik Yolu</span>
            </h1>
            <p className="text-lg text-[#7C8090] max-w-2xl mx-auto">
              Evini kendisi satmaya çalışan mülk sahiplerinin ilan linkini yapıştırın. Onlara yapay zeka destekli, profesyonel bir "İyileştirme Raporu" göndererek farkınızı gösterin.
            </p>
          </div>

          <div className="bg-[#16181D] border border-[#2A2D35] rounded-2xl p-2 shadow-2xl relative z-10">
            <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-2 relative">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C8090]" size={20} />
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Sahibinden veya HepsiEmlak ilan linki..." 
                  className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-xl pl-12 pr-4 py-4 text-base focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none transition-all placeholder:text-[#7C8090]"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={status === 'analyzing'}
                className="bg-[#F5A623] hover:bg-[#FF8B00] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0B0D] px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shrink-0 shadow-[0_0_15px_rgba(245,166,35,0.3)]"
              >
                {status === 'analyzing' ? (
                  <><Loader2 className="animate-spin" size={20} /> Analiz Ediliyor</>
                ) : (
                  <><Activity size={20} /> Rapor Oluştur</>
                )}
              </button>
            </form>
          </div>

          {/* Loading State */}
          {status === 'analyzing' && (
            <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
              <div className="w-full h-2 bg-[#2A2D35] rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-[#F5A623] to-[#FF8B00] transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-[#7C8090] font-medium flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} /> 
                {progress < 30 ? 'İlan görselleri taranıyor...' : progress < 70 ? 'Açıklama dili ve nöropazarlama analizi yapılıyor...' : 'Müşteri raporu PDF/Görsel olarak hazırlanıyor...'}
              </p>
            </div>
          )}

          {/* Result Dashboard */}
          {status === 'result' && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* Score Widget */}
                <div className="bg-[#16181D] border border-[#2A2D35] rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={60} /></div>
                  <h3 className="text-sm font-bold text-[#7C8090] tracking-wider uppercase mb-4">Piyasa Uygunluk Skoru</h3>
                  
                  {/* Fake Radial Progress */}
                  <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-[#EF4444]/20 mb-4">
                    <div className="absolute inset-0 rounded-full border-8 border-[#EF4444] border-t-transparent border-r-transparent -rotate-45"></div>
                    <span className="text-4xl font-black text-[#EF4444]">42</span>
                  </div>
                  
                  <p className="text-sm text-[#EF4444] bg-[#EF4444]/10 px-3 py-1 rounded-full font-medium">Satış İhtimali Düşük</p>
                </div>

                {/* Visual Quality Widget */}
                <div className="bg-[#16181D] border border-[#2A2D35] rounded-3xl p-6 relative overflow-hidden">
                  <h3 className="text-sm font-bold text-[#7C8090] tracking-wider uppercase mb-6 flex items-center gap-2">
                    <ImageIcon size={16}/> Görsel Kalite
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-[#F1F2F4] mb-1">
                        <span>Aydınlatma & Renk</span>
                        <span className="text-[#F5A623]">60%</span>
                      </div>
                      <div className="h-2 w-full bg-[#2A2D35] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F5A623] w-[60%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium text-[#F1F2F4] mb-1">
                        <span>Fotoğraf Açısı</span>
                        <span className="text-[#EF4444]">40%</span>
                      </div>
                      <div className="h-2 w-full bg-[#2A2D35] rounded-full overflow-hidden">
                        <div className="h-full bg-[#EF4444] w-[40%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium text-[#F1F2F4] mb-1">
                        <span>Oda Düzeni (Staging)</span>
                        <span className="text-[#EF4444]">35%</span>
                      </div>
                      <div className="h-2 w-full bg-[#2A2D35] rounded-full overflow-hidden">
                        <div className="h-full bg-[#EF4444] w-[35%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Appeal Widget */}
                <div className="bg-[#16181D] border border-[#2A2D35] rounded-3xl p-6 relative overflow-hidden">
                  <h3 className="text-sm font-bold text-[#7C8090] tracking-wider uppercase mb-6 flex items-center gap-2">
                    <Zap size={16}/> Açıklama Çekiciliği
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-[#F1F2F4] mb-1">
                        <span>Duygusal Bağ Kurma</span>
                        <span className="text-[#EF4444]">20%</span>
                      </div>
                      <div className="h-2 w-full bg-[#2A2D35] rounded-full overflow-hidden">
                        <div className="h-full bg-[#EF4444] w-[20%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium text-[#F1F2F4] mb-1">
                        <span>Aciliyet / Kıtlık Algısı</span>
                        <span className="text-[#EF4444]">10%</span>
                      </div>
                      <div className="h-2 w-full bg-[#2A2D35] rounded-full overflow-hidden">
                        <div className="h-full bg-[#EF4444] w-[10%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium text-[#F1F2F4] mb-1">
                        <span>Fayda Odaklılık</span>
                        <span className="text-[#F5A623]">50%</span>
                      </div>
                      <div className="h-2 w-full bg-[#2A2D35] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F5A623] w-[50%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="bg-gradient-to-r from-[#F5A623]/20 to-transparent border border-[#F5A623]/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none"></div>
                 <div className="relative z-10 flex-1">
                   <h2 className="text-xl md:text-2xl font-bold text-[#F1F2F4] mb-2">Müşteriye Raporu Gönder!</h2>
                   <p className="text-[#7C8090] text-sm">
                     Müşterinize bu analiz sonuçlarını, üzerinde adınızın ve kendi logonuzun olduğu premium bir PDF/Görsel şablonla anında WhatsApp'tan iletin.
                   </p>
                 </div>
                 
                 <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
                    <button 
                      onClick={handleDownloadImage}
                      disabled={isExporting}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#2A2D35] hover:bg-[#353945] text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                      Görseli İndir
                    </button>
                    
                    <button 
                      onClick={handleWhatsAppShare}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      <Share2 size={18} />
                      WhatsApp ile Gönder
                    </button>
                 </div>
              </div>
              
              <p className="text-xs text-[#7C8090] text-center mt-4">
                Not: WhatsApp üzerinden doğrudan görsel atılamadığından, lütfen önce "Görseli İndir" butonuna tıklayıp, ardından WhatsApp'tan açılan mesaja görseli ekleyerek yollayınız.
              </p>
            </div>
          )}

        </div>
      </main>

      {/* Hidden container for rendering the image/pdf export */}
      <div style={{ display: 'none' }}>
         <ReportTemplate reportRef={reportRef} />
      </div>

    </div>
  );
};

export default Analyzer;
