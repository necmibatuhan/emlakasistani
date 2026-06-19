import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const Analyzer = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, analyzing, result
  const [progress, setProgress] = useState(0);

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
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-[#F1F2F4] hover:text-[#F5A623] font-medium text-sm transition-colors">
              Giriş Yap
            </Link>
            <Link to="/auth" className="bg-[#F5A623] hover:bg-[#d9921e] text-[#0A0B0D] px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-[#F5A623]/25 hover:-translate-y-0.5">
              Ücretsiz Deneyin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto w-full">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] text-sm font-semibold mb-6">
              <Sparkles size={16} /> Ücretsiz İlan Analizi
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#F1F2F4] mb-6 leading-tight">
              Bayat İlanlarınızı <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#FF8B00]">Satışa Çevirin</span>
            </h1>
            <p className="text-lg text-[#7C8090] max-w-2xl mx-auto">
              İlanınız 60 günden uzun süredir yayında mı? Sahibinden veya HepsiEmlak linkini yapıştırın, yapay zeka saniyeler içinde zayıf noktaları bulup açıklamanızı baştan yazsın.
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
                  placeholder="https://www.sahibinden.com/ilan/..." 
                  className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-xl pl-12 pr-4 py-4 text-base focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] outline-none transition-all placeholder:text-[#7C8090]"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={status === 'analyzing'}
                className="bg-[#F5A623] hover:bg-[#FF8B00] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0B0D] px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {status === 'analyzing' ? (
                  <><Loader2 className="animate-spin" size={20} /> Analiz Ediliyor...</>
                ) : (
                  <><Sparkles size={20} /> Hemen Analiz Et</>
                )}
              </button>
            </form>
          </div>

          {/* Loading State */}
          {status === 'analyzing' && (
            <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-full h-2 bg-[#2A2D35] rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-[#F5A623] to-[#FF8B00] transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-[#7C8090] font-medium flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} /> 
                {progress < 30 ? 'İlan verileri çekiliyor...' : progress < 70 ? 'Açıklama dili ve anahtar kelimeler analiz ediliyor...' : 'Yapay zeka optimizasyon raporu hazırlanıyor...'}
              </p>
            </div>
          )}

          {/* Result State */}
          {status === 'result' && (
            <div className="mt-12 bg-gradient-to-br from-[#16181D] to-[#0A0B0D] border border-[#F5A623]/30 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] shrink-0 border border-[#EF4444]/20">
                  <span className="font-bold text-xl">42</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F1F2F4] mb-1">İlan Skorunuz Oldukça Düşük</h3>
                  <p className="text-[#7C8090]">Bu ilan mevcut metniyle %65 potansiyel müşteri kaybediyor.</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-[#0A0B0D] border border-[#2A2D35] flex gap-3">
                  <div className="text-[#EF4444] mt-0.5"><CheckCircle2 size={18} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F1F2F4]">Aciliyet Eksikliği</h4>
                    <p className="text-xs text-[#7C8090] mt-1">İlan açıklamasında alıcıyı harekete geçirecek (Call-to-Action) ve kıtlık/aciliyet hissi yaratacak hiçbir cümle bulunmuyor.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0B0D] border border-[#2A2D35] flex gap-3">
                  <div className="text-[#EF4444] mt-0.5"><CheckCircle2 size={18} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F1F2F4]">Duygusal Bağ Kurulmuyor</h4>
                    <p className="text-xs text-[#7C8090] mt-1">Sadece oda sayısı ve m2 yazılmış. Müşteri evi değil, evin sunduğu "yaşam tarzını" satın alır. Özellikler faydaya çevrilmemiş.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-5 mb-8">
                <h4 className="text-[#10B981] font-bold text-sm mb-3 flex items-center gap-2"><Sparkles size={16}/> Kapora AI Optimizasyon Örneği:</h4>
                <p className="text-sm text-[#F1F2F4] italic leading-relaxed">
                  "Sadece bir ev değil, hafta sonu kahvelerinizi deniz esintisiyle yudumlayacağınız yeni bir yaşam alanı... Bölgedeki benzer mülkler ortalama 14 günde satılmaktadır. Randevu için hemen iletişime geçin."
                </p>
              </div>

              <div className="text-center pt-6 border-t border-[#2A2D35]">
                <h3 className="text-lg font-bold text-[#F1F2F4] mb-3">Tüm Portföyünüzü Otomatik Optimize Edin</h3>
                <p className="text-sm text-[#7C8090] mb-6">Kapora AI CRM ile tüm müşterilerinizi ve portföylerinizi tek tıkla eşleştirin, satışları hızlandırın.</p>
                <Link to="/auth" className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#FF8B00] text-[#0A0B0D] px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-[#F5A623]/30 hover:-translate-y-1">
                  Ücretsiz Hesabınızı Oluşturun <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analyzer;
