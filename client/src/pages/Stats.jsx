import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Stats = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full bg-[#0A0B0D] ml-[240px]">
          <Header />
          <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
            Yükleniyor...
          </div>
        </div>
      </div>
    );
  }

  if (user?.plan !== 'proplus') {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full bg-[#0A0B0D] ml-[240px]">
          <Header />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md panel p-8 text-center">
              <div className="w-16 h-16 bg-primary-container/10 text-primary-container rounded-full flex items-center justify-center mx-auto mb-4 border custom-border">
                 <span className="material-symbols-outlined text-[32px]">star</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Bu özellik Pro+ planına özeldir</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">Detaylı istatistikler ve performans takibi için planınızı yükseltin.</p>
              <a href="/plans" className="inline-block bg-primary-container text-[#0A0B0D] px-6 py-2.5 rounded font-data-tabular hover:opacity-90 transition-opacity">Planları İncele</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalLeads = stats?.totalLeads || 0;
  const hotCount = stats?.leadsByLabel?.find(l => l.label === 'Sıcak')?.count || 0;
  const warmCount = stats?.leadsByLabel?.find(l => l.label === 'Ilık')?.count || 0;
  const coldCount = stats?.leadsByLabel?.find(l => l.label === 'Soğuk')?.count || 0;
  
  const hotPct = totalLeads ? Math.round((hotCount / totalLeads) * 100) : 0;
  const warmPct = totalLeads ? Math.round((warmCount / totalLeads) * 100) : 0;
  const coldPct = totalLeads ? Math.round((coldCount / totalLeads) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen ml-[240px] bg-[#0A0B0D]">
        <Header />
        
        {/* Canvas */}
        <main className="flex-1 p-container-padding flex flex-col gap-stack-lg overflow-x-hidden overflow-y-auto">
          {/* Header */}
          <div>
            <h1 className="font-display text-display text-on-surface">İstatistikler</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Performans metrikleri ve lead analizleri.</p>
          </div>

          {/* Top Metrics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-panel-gap">
            <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col gap-unit relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Toplam Lead</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg font-data-tabular">{totalLeads}</span>
                <span className="font-body-sm text-body-sm text-tertiary font-medium flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span> +%12</span>
              </div>
            </div>
            
            <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col gap-unit relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Sıcak Müşteri</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg font-data-tabular">{hotCount}</span>
                <span className="font-body-sm text-body-sm text-tertiary font-medium flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span> +2</span>
              </div>
            </div>
            
            <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col gap-unit relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Dönüşüm</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg font-data-tabular">%17.6</span>
                <span className="font-body-sm text-body-sm text-tertiary font-medium flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span> +3.1%</span>
              </div>
            </div>
            
            <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col gap-unit relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Ort. Skor</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg font-data-tabular">6.4</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">/ 10</span>
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <section className="flex flex-col lg:flex-row gap-panel-gap h-[360px]">
            {/* Left: Line Chart (65%) */}
            <div className="flex-[6.5] bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline-md text-headline-md text-on-surface">Son 30 gün</h2>
                <button className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              
              <div className="flex-1 relative w-full h-full">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-outline-variant/30 w-full h-0"></div>
                  <div className="border-t border-outline-variant/30 w-full h-0"></div>
                  <div className="border-t border-outline-variant/30 w-full h-0"></div>
                  <div className="border-t border-outline-variant/30 w-full h-0"></div>
                  <div className="border-t border-outline-variant/30 w-full h-0"></div>
                </div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path className="drop-shadow-md" d="M0,80 C20,70 30,90 50,50 C70,10 80,40 100,20" fill="none" stroke="#F5A623" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  <path d="M0,80 C20,70 30,90 50,50 C70,10 80,40 100,20 L100,100 L0,100 Z" fill="url(#chart-gradient)" opacity="0.2"></path>
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#F5A623"></stop>
                      <stop offset="100%" stopColor="transparent"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex justify-between mt-2 px-2 text-on-surface-variant font-body-sm text-body-sm font-data-tabular">
                <span>1 Haz</span>
                <span>8 Haz</span>
                <span>15 Haz</span>
                <span>22 Haz</span>
                <span>30 Haz</span>
              </div>
            </div>

            {/* Right: Bar Chart (35%) */}
            <div className="flex-[3.5] bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline-md text-headline-md text-on-surface">Dağılım</h2>
                <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded">Lead Tipi</span>
              </div>
              
              <div className="flex-1 flex items-end justify-around gap-2 px-4 pt-8">
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-error rounded-t-sm group-hover:brightness-110 transition-all relative" style={{ height: `${hotPct || 10}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-data-tabular text-body-sm text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">{hotCount}</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Sıcak</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-primary-container rounded-t-sm group-hover:brightness-110 transition-all relative" style={{ height: `${warmPct || 10}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-data-tabular text-body-sm text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">{warmCount}</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Ilık</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-tertiary rounded-t-sm group-hover:brightness-110 transition-all relative" style={{ height: `${coldPct || 10}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-data-tabular text-body-sm text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">{coldCount}</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Soğuk</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Stats;
