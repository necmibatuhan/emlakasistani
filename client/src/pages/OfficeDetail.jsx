import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Building2, Users, MapPin, Target, Mail } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const fetchOfficeDetail = async (id, token) => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/offices/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const OfficeDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const { data: office, isLoading } = useQuery({
    queryKey: ['office', id],
    queryFn: () => fetchOfficeDetail(id, token)
  });

  if (isLoading) return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-[13px] text-[#7C8090]">Yükleniyor...</div>
    </div>
  );

  if (!office) return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-[13px] text-[#7C8090]">Ofis bulunamadı.</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto w-full">
          
          <div className="flex items-center space-x-4 mb-8">
            <Link to="/offices" className="w-8 h-8 bg-[#16181D] border border-[#2A2D35] rounded-[6px] flex items-center justify-center text-[#7C8090] hover:text-[#F1F2F4] hover:bg-[#1E2028] transition-colors">
              <span className="font-bold text-[14px]">&larr;</span>
            </Link>
            <div>
              <h1 className="text-[20px] font-medium text-[#F1F2F4] flex items-center space-x-2">
                <Building2 size={20} className="text-[#F5A623]" />
                <span>{office.name} Detayı</span>
              </h1>
              <p className="text-[#7C8090] text-[13px] mt-1 flex items-center space-x-1.5">
                <MapPin size={12} /> <span>{office.city}, {office.region}</span>
              </p>
            </div>
          </div>

          <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6 mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-1">Genel İstatistikler</h3>
              <p className="text-[12px] text-[#7C8090]">Ofise ait toplam performans verileri</p>
            </div>
            <div className="flex space-x-8">
              <div className="text-center">
                <p className="text-[10px] text-[#7C8090] font-bold uppercase tracking-wider mb-1">Danışman</p>
                <p className="text-[24px] font-mono text-[#F1F2F4]">{office.agents?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] overflow-hidden">
            <div className="p-4 border-b border-[#2A2D35] bg-[#0A0B0D]">
              <h3 className="text-[14px] font-medium text-[#F1F2F4]">Ofis Danışmanları</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A0B0D] text-[11px] uppercase tracking-wider text-[#7C8090] border-b border-[#2A2D35]">
                    <th className="p-4 font-medium">İsim Soyisim</th>
                    <th className="p-4 font-medium">E-posta</th>
                    <th className="p-4 font-medium">Toplam Lead</th>
                    <th className="p-4 font-medium">Dönüşüm Oranı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D35] text-[13px]">
                  {office.agents?.map(agent => (
                    <tr key={agent.id} className="hover:bg-[#1E2028] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#2A2D35] text-[#F1F2F4] rounded-[6px] flex items-center justify-center text-[12px] font-medium">
                            {agent.name.charAt(0)}
                          </div>
                          <span className="font-medium text-[#F1F2F4]">{agent.name}</span>
                          {agent.role === 'office_manager' && <span className="px-2 py-0.5 bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 text-[10px] rounded-[4px] font-medium uppercase tracking-wider">Müdür</span>}
                        </div>
                      </td>
                      <td className="p-4 text-[#7C8090] flex items-center space-x-1.5">
                        <Mail size={12} />
                        <span>{agent.email}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <Target size={12} className="text-[#7C8090]" />
                          <span className="font-mono text-[#F1F2F4]">{agent.lead_count}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium border ${Number(agent.conversionRate) > 10 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-[#2A2D35] text-[#7C8090] border-[#4A4E5A]'}`}>
                          % {agent.conversionRate}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {office.agents?.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-[#7C8090] text-[13px]">Bu ofise kayıtlı danışman yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OfficeDetail;
