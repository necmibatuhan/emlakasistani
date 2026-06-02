import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Building2, Users, MapPin, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const fetchOffices = async (token) => {
  const { data } = await axios.get('http://localhost:5001/api/offices', {
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
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto w-full">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-[20px] font-medium text-[#F1F2F4]">Ofis Yönetimi</h1>
              <p className="text-[13px] text-[#7C8090] mt-1">Bölgedeki tüm ofislerin performans ve durumları</p>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]">
                <Search size={14} />
              </div>
              <input 
                type="text" 
                placeholder="Ofis veya bölge ara..." 
                className="w-64 bg-[#16181D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] pl-9 p-2 text-[12px] focus:border-[#F5A623] outline-none transition-colors placeholder-[#4A4E5A]"
              />
            </div>
          </div>

          <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-[#7C8090] text-[13px]">Yükleniyor...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A0B0D] text-[11px] uppercase tracking-wider text-[#7C8090] border-b border-[#2A2D35]">
                    <th className="p-4 font-medium">Ofis Adı</th>
                    <th className="p-4 font-medium">Konum</th>
                    <th className="p-4 font-medium">Danışman</th>
                    <th className="p-4 font-medium">Toplam Lead</th>
                    <th className="p-4 font-medium">Dönüşüm</th>
                    <th className="p-4 font-medium text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D35] text-[13px]">
                  {offices?.map(office => (
                    <tr key={office.id} className="hover:bg-[#1E2028] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#2A2D35] text-[#F1F2F4] rounded-[6px] flex items-center justify-center"><Building2 size={14} /></div>
                          <span className="font-medium text-[#F1F2F4]">{office.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5 text-[#7C8090]">
                          <MapPin size={12} />
                          <span>{office.city}, {office.region}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5 text-[#F1F2F4]">
                          <Users size={12} className="text-[#7C8090]" />
                          <span>{office.agent_count}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[#F1F2F4]">{office.lead_count}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-[4px] text-[11px] font-medium border ${Number(office.conversionRate) > 10 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20'}`}>
                          % {office.conversionRate}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link to={`/offices/${office.id}`} className="text-[#F5A623] font-medium text-[11px] uppercase tracking-wider hover:text-[#d9921e] transition-colors">Detaylar &rarr;</Link>
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
