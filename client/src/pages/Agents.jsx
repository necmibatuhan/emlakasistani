import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Mail, Target } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Agents = () => {
  const { token, user } = useContext(AuthContext);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        if (user.role === 'office_manager') {
          const res = await axios.get(`http://localhost:5001/api/offices/${user.office_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAgents(res.data.agents || []);
        } else {
          const resOffices = await axios.get('http://localhost:5001/api/offices', {
            headers: { Authorization: `Bearer ${token}` }
          });
          let allAgents = [];
          for (let office of resOffices.data) {
            const resOffice = await axios.get(`http://localhost:5001/api/offices/${office.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (resOffice.data.agents) {
              allAgents = [...allAgents, ...resOffice.data.agents.map(a => ({...a, office_name: office.name}))];
            }
          }
          setAgents(allAgents);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAgents();
  }, [user, token]);

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto w-full">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[20px] font-medium text-[#F1F2F4]">Tüm Danışmanlar</h1>
          </div>

          <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] overflow-hidden">
            <div className="p-4 border-b border-[#2A2D35] flex justify-between items-center bg-[#0A0B0D]">
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]"><Search size={14}/></div>
                <input type="text" placeholder="Danışman Ara..." className="w-full text-[13px] bg-[#16181D] border border-[#2A2D35] rounded-[6px] pl-9 p-2 outline-none focus:border-[#F5A623] text-[#F1F2F4] placeholder-[#4A4E5A] transition-colors" />
              </div>
              <span className="text-[11px] font-medium text-[#7C8090] border border-[#2A2D35] px-3 py-1 rounded-[4px] bg-[#16181D]">Toplam {agents.length} Danışman</span>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[#2A2D35] border-t-[#F5A623] rounded-full animate-spin" /></div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0A0B0D] text-[11px] uppercase tracking-wider text-[#7C8090] border-b border-[#2A2D35]">
                      <th className="p-4 font-medium">Danışman</th>
                      {user?.role === 'company_admin' && <th className="p-4 font-medium">Ofis</th>}
                      <th className="p-4 font-medium">Toplam Lead</th>
                      <th className="p-4 font-medium">Sıcak Lead</th>
                      <th className="p-4 font-medium">Dönüşüm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2D35] text-[13px]">
                    {agents.map(agent => (
                      <tr key={agent.id} className="hover:bg-[#1E2028] transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#2A2D35] rounded-[6px] flex items-center justify-center font-medium text-[#F1F2F4]">
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-[#F1F2F4] block">{agent.name}</span>
                              <span className="text-[11px] text-[#7C8090] flex items-center space-x-1 mt-0.5"><Mail size={10}/> <span>{agent.email}</span></span>
                            </div>
                          </div>
                        </td>
                        {user?.role === 'company_admin' && (
                          <td className="p-4 text-[#7C8090] font-medium">
                            {agent.office_name}
                          </td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center space-x-1.5 text-[#F1F2F4]">
                            <Target size={12} className="text-[#7C8090]" />
                            <span className="font-mono">{agent.lead_count}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                            <span>{agent.hot_leads}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-[4px] text-[11px] font-medium border ${Number(agent.conversionRate) > 10 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-[#2A2D35] text-[#7C8090] border-[#4A4E5A]'}`}>
                            % {agent.conversionRate}
                          </span>
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
    </div>
  );
};

export default Agents;
