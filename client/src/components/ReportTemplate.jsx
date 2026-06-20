import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Target, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

const ReportTemplate = ({ reportRef, data }) => {
  const { user } = useContext(AuthContext);
  const agentName = user?.name || "Kapora Danışmanı";
  
  // Dinamik veriler
  const oldScore = data?.score || 42;
  const marketScore = Math.min(oldScore + 40, 98); 
  
  const weaknesses = data?.weaknesses || [
    "Mevcut fotoğrafların aydınlatma ve açısı düşük. Görseller profesyonel değil.",
    "Açıklama yetersiz ve duygusal bağ kurmuyor."
  ];

  const strengths = data?.strengths || [
    "Lokasyon avantajı", "Geniş kullanım alanı"
  ];

  return (
    <div 
      ref={reportRef} 
      className="bg-[#0A0B0D] w-[800px] p-8 border-4 border-[#2A2D35] rounded-3xl relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif', color: '#F1F2F4' }}
    >
      {/* Background elements for premium look */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/5 rounded-full pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981]/5 rounded-full pointer-events-none -ml-20 -mb-20"></div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#2A2D35] pb-6 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#FF8B00] flex items-center justify-center font-bold text-white text-2xl shadow-lg">
            K
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white m-0 leading-tight">Kapora <span className="text-[#F5A623]">AI</span></h1>
            <p className="text-xs text-[#7C8090] tracking-widest uppercase mt-1">Profesyonel İlan Analizi</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#7C8090] mb-1">Hazırlayan</p>
          <p className="text-base font-bold text-white">{agentName}</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
        {/* Old Score */}
        <div className="bg-[#16181D] border border-[#2A2D35] rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-2 right-2 opacity-10"><Target size={40}/></div>
           <p className="text-xs font-bold text-[#7C8090] uppercase tracking-wider mb-2">Mevcut Durum</p>
           <div className="flex items-end gap-2">
             <span className="text-4xl font-black text-[#EF4444] leading-none">{oldScore}</span>
             <span className="text-sm text-[#7C8090] mb-1">/100</span>
           </div>
           <p className="text-xs text-[#EF4444] mt-2 bg-[#EF4444]/10 inline-block px-2 py-1 rounded font-medium w-fit">
             Satış İhtimali Düşük
           </p>
        </div>

        {/* New Expected Score */}
        <div className="bg-gradient-to-br from-[#16181D] to-[#0A0B0D] border border-[#F5A623]/30 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shadow-[0_0_20px_rgba(245,166,35,0.1)]">
           <div className="absolute top-2 right-2 opacity-20 text-[#F5A623]"><Sparkles size={40}/></div>
           <p className="text-xs font-bold text-[#F5A623] uppercase tracking-wider mb-2">Hedeflenen Kapora AI Skoru</p>
           <div className="flex items-end gap-2">
             <span className="text-4xl font-black text-[#10B981] leading-none">{marketScore}</span>
             <span className="text-sm text-[#7C8090] mb-1">/100</span>
           </div>
           <p className="text-xs text-[#10B981] mt-2 bg-[#10B981]/10 inline-block px-2 py-1 rounded font-medium w-fit">
             Piyasa Üstü Çekicilik
           </p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-4 mb-8 relative z-10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2A2D35] pb-2 mb-4">Tespitler ve İyileştirmeler</h3>
        
        <div className="flex items-start gap-3">
          <div className="text-[#EF4444] mt-0.5"><TrendingUp size={18} /></div>
          <div>
            <h4 className="text-sm font-bold text-white">İlanın Zayıf Yönleri</h4>
            <ul className="text-xs text-[#7C8090] mt-1 space-y-1">
              {weaknesses.map((w, i) => <li key={i}>- {w}</li>)}
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3 mt-4">
          <div className="text-[#10B981] mt-0.5"><CheckCircle2 size={18} /></div>
          <div>
            <h4 className="text-sm font-bold text-white">Yapay Zeka Destekli Satış Stratejisi</h4>
            <p className="text-xs text-[#7C8090] mt-1 leading-relaxed">
              Mevcut ilanınızdaki bu eksiklikler giderilip, alıcıda "hemen aramalıyım" hissi uyandıracak duygusal ve fayda odaklı bir yapıya kavuşturulacaktır.
              {data?.improved_description && (
                <span className="block mt-2 p-2 bg-[#2A2D35]/50 rounded italic border-l-2 border-[#10B981]">
                  "{data.improved_description}"
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#F5A623] rounded-xl p-6 text-center relative z-10 shadow-[0_10px_30px_rgba(245,166,35,0.2)]">
        <h4 className="text-lg font-black text-[#0A0B0D] mb-2">Evinizi %40 Daha Hızlı Satalım</h4>
        <p className="text-sm text-[#0A0B0D]/80 font-medium">
          Yapay zeka analiz raporunuzu incelediniz. Kapora AI teknolojileriyle portföyünüzü en iyi şekilde pazarlamak için benimle iletişime geçin.
        </p>
      </div>
    </div>
  );
};

export default ReportTemplate;
