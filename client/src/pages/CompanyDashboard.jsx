import React, { useState, useEffect, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { Building2, Users, Target, Activity, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchCompanyStats = async (token) => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/stats/company`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const CompanyDashboard = () => {
  const { token, user } = useContext(AuthContext);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['company_stats'],
    queryFn: () => fetchCompanyStats(token)
  });

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto w-full">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[20px] font-medium text-[#F1F2F4]">Şirket Özeti</h1>
            <div className="text-[13px] text-[#7C8090]">
              Son Güncelleme: <span className="text-[#F1F2F4] font-medium">{new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Toplam Ofis" value={stats?.offices || 0} icon={<Building2 size={20} />} />
            <StatCard title="Toplam Danışman" value={stats?.agents || 0} icon={<Users size={20} />} />
            <StatCard title="Aktif Portföy" value={stats?.properties || 0} icon={<Target size={20} />} />
            <StatCard title="Aylık Dönüşüm" value={`%${stats?.conversionRate || 0}`} icon={<Activity size={20} />} color="text-[#10B981]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[14px] font-medium text-[#F1F2F4]">En İyi Performans (Ofis)</h3>
                <Link to="/offices" className="text-[11px] text-[#F5A623] hover:text-[#d9921e] uppercase tracking-wider font-medium">Tümünü Gör</Link>
              </div>
              <div className="space-y-4">
                {stats?.topOffices?.map((office, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#0A0B0D] rounded-[6px] border border-[#2A2D35]">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#2A2D35] rounded-full flex items-center justify-center text-[#F1F2F4] text-[12px] font-medium">{idx + 1}</div>
                      <div>
                        <p className="text-[13px] font-medium text-[#F1F2F4]">{office.name}</p>
                        <p className="text-[11px] text-[#7C8090]">{office.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-mono text-[#F1F2F4]">{office.lead_count} Lead</p>
                      <p className="text-[11px] text-[#10B981]">%{office.conversionRate} Dönüşüm</p>
                    </div>
                  </div>
                ))}
                {!stats?.topOffices?.length && <p className="text-[#7C8090] text-[12px] text-center py-4">Veri bulunamadı.</p>}
              </div>
            </div>

            <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[14px] font-medium text-[#F1F2F4]">Sistem Durumu</h3>
              </div>
              <div className="flex items-center space-x-4 mb-4 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-[6px]">
                <CheckCircle className="text-[#10B981]" size={24} />
                <div>
                  <p className="text-[13px] font-medium text-[#10B981]">Tüm servisler aktif</p>
                  <p className="text-[11px] text-[#10B981]/70">API, Veritabanı ve WhatsApp bağlantısı sorunsuz çalışıyor.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color = "text-[#F1F2F4]" }) => (
  <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6 flex flex-col relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 text-[#2A2D35] opacity-20 transform group-hover:scale-110 transition-transform">
      {React.cloneElement(icon, { size: 100 })}
    </div>
    <p className="text-[12px] text-[#7C8090] font-medium mb-2 uppercase tracking-wider relative z-10">{title}</p>
    <h3 className={`text-[32px] font-mono font-medium ${color} relative z-10`}>{value}</h3>
  </div>
);

export default CompanyDashboard;
