import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Area, AreaChart } from 'recharts';

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
      <div className="flex h-screen bg-[#0F1117] overflow-hidden text-[#F1F2F4]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#7C8090] text-[13px]">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (user?.plan !== 'proplus') {
    return (
      <div className="flex h-screen bg-[#0F1117] overflow-hidden text-[#F1F2F4]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-[#16181D] border border-[#2A2D35] rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-[#2A1A00] text-[#F5A623] rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⭐</div>
            <h2 className="text-[18px] font-medium text-[#F1F2F4] mb-2">Bu özellik Pro+ planına özeldir</h2>
            <p className="text-[13px] text-[#7C8090] mb-6">Detaylı istatistikler ve performans takibi için planınızı yükseltin.</p>
            <a href="/plans" className="inline-block bg-[#F5A623] text-[#0F1117] px-6 py-2.5 rounded-md text-[13px] font-medium hover:bg-[#d9921e] transition-colors">Planları İncele</a>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F1117] border border-[#2A2D35] p-3 rounded-lg shadow-xl">
          <p className="text-[11px] text-[#7C8090] mb-1">{label}</p>
          <p className="text-[13px] font-bold text-[#F1F2F4]">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        <div className="p-8 max-w-6xl mx-auto w-full">
          <h1 className="text-[20px] font-medium text-[#F1F2F4] mb-8">İstatistikler ve Analizler</h1>
          
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#16181D] p-5 rounded-xl border border-[#2A2D35]">
              <div className="text-[12px] text-[#7C8090] font-medium mb-2">Bu Ay Toplam Lead</div>
              <div className="text-[32px] font-mono font-semibold text-[#F1F2F4]">{stats?.totalLeads || 0}</div>
            </div>
            <div className="bg-[#16181D] p-5 rounded-xl border border-[#2A2D35]">
              <div className="text-[12px] text-[#7C8090] font-medium mb-2">Dönüşüm Oranı</div>
              <div className="text-[32px] font-mono font-semibold text-[#F1F2F4]">%{(stats?.conversionRate || 0)}</div>
            </div>
            <div className="bg-[#16181D] p-5 rounded-xl border border-[#2A2D35]">
              <div className="text-[12px] text-[#7C8090] font-medium mb-2">Ortalama Skor</div>
              <div className="text-[32px] font-mono font-semibold text-[#F1F2F4]">6.4</div> {/* Example static metric for now as requested by user mockup */}
            </div>
            <div className="bg-[#16181D] p-5 rounded-xl border border-[#2A2D35]">
              <div className="text-[12px] text-[#7C8090] font-medium mb-2">Satış Tamamlanan</div>
              <div className="text-[32px] font-mono font-semibold text-[#F1F2F4]">
                {stats?.statusDist?.find(s => s.name === 'Satış Tamamlandı')?.value || 0}
              </div>
            </div>
          </div>

          {/* Two Column Area */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            
            {/* Left: 60% Trend */}
            <div className="w-full lg:w-[60%] bg-[#16181D] p-6 rounded-xl border border-[#2A2D35]">
              <h3 className="text-[13px] font-medium text-[#7C8090] mb-6">Son 30 Gün Lead Trendi</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.trend || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2D35" />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: '#7C8090'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 11, fill: '#7C8090'}} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" name="Lead" stroke="#F5A623" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: 40% Donut */}
            <div className="w-full lg:w-[40%] bg-[#16181D] p-6 rounded-xl border border-[#2A2D35] flex flex-col">
              <h3 className="text-[13px] font-medium text-[#7C8090] mb-6">Lead Dağılımı</h3>
              <div className="flex-1 relative min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={stats?.labelDist || []}
                      cx="50%" cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {(stats?.labelDist || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Sıcak' ? '#EF4444' : entry.name === 'Ilık' ? '#F5A623' : '#3B82F6'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[24px] font-mono font-bold text-[#F1F2F4]">{stats?.totalLeads || 0}</span>
                  <span className="text-[11px] text-[#7C8090] uppercase tracking-wider">Lead</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar Chart (Full Width) */}
          <div className="w-full bg-[#16181D] p-6 rounded-xl border border-[#2A2D35]">
            <h3 className="text-[13px] font-medium text-[#7C8090] mb-6">Durum Dağılımı</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={stats?.statusDist || []} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2D35" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: '#7C8090'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 11, fill: '#7C8090'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#1E2028'}} content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Adet" fill="#2A3C6B" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Stats;
