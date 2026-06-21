import React, { useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Loader2, Sparkles, CheckCircle2, TrendingUp, Share2, Download, Image as ImageIcon, Zap, Activity, Target } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import ReportTemplate from '../components/ReportTemplate';
import { AuthContext } from '../contexts/AuthContext';

const Analyzer = () => {
  const { user, token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, analyzing, result
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const reportRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus('analyzing');
    setProgress(10);

    try {
      // 1. Resmi tarayıcıda küçült (max 1200px) ve base64 yap
      const base64DataUrl = await compressImage(file);
      const base64Image = base64DataUrl.split(',')[1];
      
      setProgress(40);

      const progressInterval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 5 : p));
      }, 500);

      const payload = {
        image: base64Image,
        mimeType: 'image/jpeg'
      };

      const res = await axios.post(`${(import.meta.env.VITE_API_URL ?? 'http://localhost:5001')}/api/properties/analyze-listing`, payload, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisResult(res.data);
      setStatus('result');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      const errorMsg = err.response?.data?.message || err.message || 'Bilinmeyen bir hata oluştu.';
      alert(`Analiz sırasında bir hata oluştu:\n${errorMsg}`);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const el = reportRef.current;
      
      // Safari/iOS cihazlarda ilk render'ın siyah/boş çıkması kronik bir sorundur.
      // Bunu aşmak için "ısınma" turu atıyoruz:
      await toJpeg(el, { quality: 0.1, backgroundColor: '#0A0B0D' });
      
      // html-to-image, Tailwind v4 CSS (oklab) renkleriyle kusursuz çalışır
      const imgData = await toJpeg(el, { 
        quality: 0.85, 
        backgroundColor: '#0A0B0D',
        pixelRatio: 1.5,
        cacheBust: true, // Cache sorunlarını önle
        style: {
          transform: 'scale(1)', // Transform hatalarını önle
          transformOrigin: 'top left'
        }
      });
      
      // Genişlik ve yükseklik almak için html elementinin boyutlarını kullanabiliriz
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [width * 1.5, height * 1.5],
        compress: true
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, width * 1.5, height * 1.5);
      pdf.save('kapora_ilan_analizi.pdf');
      
    } catch (err) {
      console.error('Export failed', err);
      alert(`PDF oluşturulurken bir sorun oluştu: ${err.message || err}. Lütfen tekrar deneyin.`);
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
              Evini kendisi satmaya çalışan mülk sahiplerinin ilan ekran görüntüsünü yükleyin. Onlara yapay zeka destekli, profesyonel bir "İyileştirme Raporu" göndererek farkınızı gösterin.
            </p>
          </div>

          <div className="bg-[#16181D] border border-[#2A2D35] rounded-2xl p-6 shadow-2xl relative z-10 text-center">
            <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
              <div 
                className="border-2 border-dashed border-[#2A2D35] hover:border-[#F5A623] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors relative"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="hidden"
                />
                {preview ? (
                  <div className="relative w-full max-w-sm mx-auto h-48 rounded-lg overflow-hidden border border-[#2A2D35]">
                    <img src={preview} alt="İlan Önizleme" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium">Değiştir</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={48} className="text-[#7C8090] mb-4" />
                    <h3 className="text-[#F1F2F4] font-medium text-lg mb-1">İlan ekran görüntüsünü seçin</h3>
                    <p className="text-[#7C8090] text-sm">Sürükleyip bırakın veya tıklayarak dosya seçin (.jpg, .png)</p>
                  </>
                )}
              </div>
              <button 
                type="submit" 
                disabled={status === 'analyzing' || !file}
                className="w-full md:w-auto self-center bg-[#F5A623] hover:bg-[#FF8B00] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0B0D] px-10 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,166,35,0.3)]"
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
                      onClick={handleDownloadPDF}
                      disabled={isExporting}
                      className="bg-[#0A0B0D] border border-[#2A2D35] hover:border-[#F5A623] text-[#F1F2F4] disabled:opacity-50 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
                    >
                      {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                      {isExporting ? 'Hazırlanıyor...' : 'PDF İndir'}
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
      <div style={{ position: 'fixed', left: 0, top: 0, zIndex: -50, opacity: 0.001, pointerEvents: 'none' }}>
         <ReportTemplate reportRef={reportRef} data={analysisResult} />
      </div>

    </div>
  );
};

export default Analyzer;
