import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Building2, Users, MapPin, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const fetchOffices = async (token) => {
  const { data } = await axios.get(`${(import.meta.env.VITE_API_URL ?? 'http://localhost:5001')}/api/offices`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const Offices = () => {
  const { token } = useContext(AuthContext);

  const { data: offices, isLoading } = useQuery({
    queryKey: ['offices'],
    queryFn: () => fetchOffices(token)
  });

  return (
    <div className="flex min-h-screen bg-[#0A0B0D]">
      <Sidebar />
      <div className="lg:ml-[240px] flex-1 flex flex-col min-h-screen w-full">
        <Header />
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-[20px] font-medium text-[#F1F2F4]">Ofis Yönetimi</h1>
              <p className="text-[13px] text-[#7C8090] mt-1">Bölgedeki tüm ofislerin performans ve durumları</p>
            </div>
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]">
                <Search size={14} />
              </div>
              <input 
                type="text" 
                placeholder="Ofis veya bölge ara..." 
                className="w-full md:w-64 bg-[#16181D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] pl-9 p-2 min-h-[44px] text-[12px] focus:border-[#F5A623] outline-none transition-colors placeholder-[#4A4E5A]"
              />
            </div>
          </div>

          <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-[#7C8090] text-[13px]">Yükleniyor...</div>
            ) : (
              <table className="w-full text-left border-collapse block md:table">
                <thead className="hidden md:table-header-group">
                  <tr className="bg-[#0A0B0D] text-[11px] uppercase tracking-wider text-[#7C8090] border-b border-[#2A2D35]">
                    <th className="p-4 font-medium">Ofis Adı</th>
                    <th className="p-4 font-medium">Konum</th>
                    <th className="p-4 font-medium">Danışman</th>
                    <th className="p-4 font-medium">Toplam Lead</th>
                    <th className="p-4 font-medium">Dönüşüm</th>
                    <th className="p-4 font-medium text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="block md:table-row-group divide-y divide-[#2A2D35] text-[13px]">
                  {offices?.map(office => (
                    <tr key={office.id} className="block md:table-row hover:bg-[#1E2028] transition-colors p-4 md:p-0">
                      <td className="block md:table-cell p-2 md:p-4">
                        <div className="flex items-center space-x-3 mb-2 md:mb-0">
                          <div className="w-8 h-8 bg-[#2A2D35] text-[#F1F2F4] rounded-[6px] flex items-center justify-center shrink-0"><Building2 size={14} /></div>
                          <span className="font-medium text-[#F1F2F4] block">{office.name}</span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-2 md:p-4 flex justify-between md:table-cell">
                        <span className="md:hidden font-medium text-[#7C8090]">Konum:</span>
                        <div className="flex items-center space-x-1.5 text-[#7C8090]">
                          <MapPin size={12} />
                          <span>{office.city}, {office.region}</span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-2 md:p-4 flex justify-between md:table-cell">
                        <span className="md:hidden font-medium text-[#7C8090]">Danışman:</span>
                        <div className="flex items-center space-x-1.5 text-[#F1F2F4]">
                          <Users size={12} className="text-[#7C8090]" />
                          <span>{office.agent_count}</span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-2 md:p-4 flex justify-between md:table-cell font-mono text-[#F1F2F4]">
                        <span className="md:hidden font-medium text-[#7C8090] font-sans">Toplam Lead:</span>
                        {office.lead_count}
                      </td>
                      <td className="block md:table-cell p-2 md:p-4 flex justify-between md:table-cell">
                        <span className="md:hidden font-medium text-[#7C8090]">Dönüşüm:</span>
                        <span className={`px-2 py-1 rounded-[4px] text-[11px] font-medium border ${Number(office.conversionRate) > 10 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20'}`}>
                          % {office.conversionRate}
                        </span>
                      </td>
                      <td className="block md:table-cell p-2 md:p-4 md:text-right border-b border-[#2A2D35] md:border-none pb-4 md:pb-4 mb-2 md:mb-0 mt-2 md:mt-0 text-center md:text-right">
                        <Link to={`/offices/${office.id}`} className="inline-block bg-[#2A2D35] md:bg-transparent px-4 py-2 md:p-0 rounded-[6px] text-[#F5A623] font-medium text-[11px] md:text-[11px] uppercase tracking-wider hover:text-[#d9921e] transition-colors w-full md:w-auto min-h-[44px] md:min-h-0 flex items-center justify-center">Detaylar &rarr;</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offices;
