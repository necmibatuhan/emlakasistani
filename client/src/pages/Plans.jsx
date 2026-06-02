import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

const Plans = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [betaCode, setBetaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpgrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (betaCode.toUpperCase() !== 'EMLAK2025') {
        throw new Error('Geçersiz beta kodu.');
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/upgrade`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setSuccess('Tebrikler! PRO+ planına yükseltildiniz.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Yükseltme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-[1000px] mx-auto w-full">
          <h1 className="text-[20px] font-medium text-[#F1F2F4] mb-2">Abonelik Planları</h1>
          <p className="text-[13px] text-[#7C8090] mb-12">İhtiyaçlarınıza en uygun planı seçin ve işinizi büyütün.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Ücretsiz */}
            <div className="bg-[#16181D] border border-[#2A2D35] rounded-[8px] p-8 flex flex-col">
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
              <button disabled className="w-full py-2.5 text-center text-[13px] font-medium text-[#7C8090] border border-[#2A2D35] rounded-[6px] opacity-50 cursor-not-allowed">
                Mevcut Plan
              </button>
            </div>

            {/* Pro */}
            <div className="bg-[#1A1600] border border-[#F5A623] rounded-[8px] p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl">
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
              <button className="w-full py-2.5 text-center text-[13px] font-medium bg-[#F5A623] text-[#0A0B0D] hover:bg-[#d9921e] rounded-[6px] transition-colors">
                Pro'ya Geç
              </button>
            </div>

            {/* Pro+ */}
            <div className="bg-[#16181D] border border-[#2A2D35] rounded-[8px] p-8 flex flex-col relative">
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
              <button disabled={user?.plan === 'proplus'} className={`w-full py-2.5 text-center text-[13px] font-medium rounded-[6px] transition-colors ${user?.plan === 'proplus' ? 'bg-[#2A2D35] text-[#7C8090] cursor-not-allowed' : 'text-[#F1F2F4] border border-[#2A2D35] hover:bg-[#1E2025]'}`}>
                {user?.plan === 'proplus' ? 'Mevcut Plan' : "Pro+'ya Geç"}
              </button>
            </div>

          </div>

          <div className="bg-[#16181D] border border-[#2A2D35] p-6 rounded-[8px] max-w-md">
            <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-2">Beta Promosyon Kodu</h3>
            <p className="text-[12px] text-[#7C8090] mb-4">Erken erişim dönemine özel davetiye kodunuzu girerek Pro+ avantajlarından faydalanın.</p>
            
            {success && <div className="mb-4 p-3 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[12px] font-medium rounded-[6px]">{success}</div>}
            {error && <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[12px] rounded-[6px]">{error}</div>}
            
            <form onSubmit={handleUpgrade} className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Kodu girin (örn: EMLAK2025)" 
                className="flex-1 bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none uppercase font-mono text-[#F1F2F4] placeholder-[#7C8090]"
                value={betaCode}
                onChange={e => setBetaCode(e.target.value)}
                required
              />
              <button 
                type="submit" 
                disabled={loading || user?.plan === 'proplus'}
                className="bg-[#F5A623] text-[#0A0B0D] px-5 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#d9921e] transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Aktifleştir'}
              </button>
            </form>
            {user?.plan === 'proplus' && (
              <div className="mt-4 text-[12px] text-[#F5A623] font-medium">
                Şu anda en üst plandasınız!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Plans;
