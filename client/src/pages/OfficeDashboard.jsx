import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { CheckCircle } from 'lucide-react';

const fetchOfficeData = async (token, officeId) => {
  const { data } = await axios.get(`http://localhost:5001/api/offices/${officeId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const fetchOfficeLeads = async (token) => {
  const { data } = await axios.get('http://localhost:5001/api/leads', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const OfficeDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('Tümü');
  const [selectedLead, setSelectedLead] = useState(null);

  const { data: office } = useQuery({
    queryKey: ['office', user?.office_id],
    queryFn: () => fetchOfficeData(token, user?.office_id),
    enabled: !!user?.office_id
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchOfficeLeads(token)
  });

  const assignMutation = useMutation({
    mutationFn: ({ leadId, agentId }) => axios.put(`http://localhost:5001/api/leads/${leadId}`, { assigned_to: agentId }, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(prev => ({ ...prev, assigned_to: assignMutation.variables?.agentId }));
    }
  });

  const filteredLeads = leads.filter(l => filter === 'Tümü' || l.label === filter);

  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.label === 'Sıcak').length,
    warm: leads.filter(l => l.label === 'Ilık').length,
    today: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length
  };

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto w-full">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-[20px] font-medium text-[#F1F2F4]">{office?.name || 'Ofis Yönetimi'}</h1>
              <p className="text-[13px] text-[#7C8090] mt-1">Gelen tüm talepleri ve danışman performansını yönetin.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Bu Ay Toplam Lead" value={stats.total} />
            <StatCard title="Sıcak Lead" value={stats.hot} color="text-[#EF4444]" />
            <StatCard title="Ilık Lead" value={stats.warm} color="text-[#F5A623]" />
            <StatCard title="Bugün Eklenen" value={stats.today} color="text-[#3B82F6]" />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">
            {/* Left: Lead List (60%) */}
            <div className="w-full lg:w-3/5 bg-[#16181D] rounded-[8px] border border-[#2A2D35] flex flex-col">
              <div className="p-4 border-b border-[#2A2D35] flex gap-2 overflow-x-auto bg-[#0A0B0D]">
                {['Tümü', 'Sıcak', 'Ilık', 'Soğuk'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors whitespace-nowrap border ${filter === f ? 'bg-[#1E2028] text-[#F1F2F4] border-[#4A4E5A]' : 'bg-[#0A0B0D] text-[#7C8090] border-[#2A2D35] hover:bg-[#1E2025]'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {leadsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px]"></div>)}
                  </div>
                ) : filteredLeads.map(lead => (
                  <div 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className={`relative p-4 rounded-[6px] border flex items-center justify-between cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-[#1E2028] border-[#4A4E5A]' : 'bg-[#0A0B0D] border-[#2A2D35] hover:border-[#4A4E5A]'}`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[6px] ${lead.label === 'Sıcak' ? 'bg-[#EF4444]' : lead.label === 'Ilık' ? 'bg-[#F5A623]' : 'bg-[#3B82F6]'}`}></div>
                    <div className="pl-3">
                      <h4 className="font-medium text-[#F1F2F4] text-[14px]">{lead.name}</h4>
                      <p className="text-[12px] text-[#7C8090] mt-1">Skor: {lead.score}/10 • Danışman: <span className="text-[#F1F2F4]">{office?.agents?.find(a => a.id === lead.assigned_to)?.name || 'Atanmamış'}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[#4A4E5A] mb-2">{new Date(lead.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Lead Detail (40%) */}
            <div className="w-full lg:w-2/5 bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6 overflow-y-auto flex flex-col items-center">
              {selectedLead ? (
                <div className="w-full">
                  <div className="flex justify-center mb-8 mt-4">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#2A2D35]" />
                        <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent"
                          strokeDasharray={301.59} strokeDashoffset={301.59 - (301.59 * selectedLead.score) / 10}
                          className={`${selectedLead.label === 'Sıcak' ? 'text-[#EF4444]' : selectedLead.label === 'Ilık' ? 'text-[#F5A623]' : 'text-[#3B82F6]'} transition-all duration-1000 ease-out`} />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[28px] font-mono font-medium text-[#F1F2F4]">{selectedLead.score}</span>
                        <span className="text-[9px] font-medium text-[#7C8090] uppercase tracking-widest mt-1">Skor</span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-[18px] font-medium text-center text-[#F1F2F4] mb-8">{selectedLead.name}</h2>

                  {/* Atama Dropdown */}
                  <div className="mb-8 p-4 bg-[#0A0B0D] rounded-[6px] border border-[#2A2D35]">
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-2 uppercase tracking-wider">Atanan Danışman</label>
                    <select 
                      className="w-full p-2.5 rounded-[6px] bg-[#16181D] border border-[#2A2D35] text-[#F1F2F4] text-[13px] focus:border-[#F5A623] outline-none transition-colors"
                      value={selectedLead.assigned_to || ''}
                      onChange={(e) => assignMutation.mutate({ leadId: selectedLead.id, agentId: e.target.value })}
                    >
                      <option value="">Danışman Seçin...</option>
                      {office?.agents?.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[11px] font-medium text-[#7C8090] mb-3 uppercase tracking-wider border-b border-[#2A2D35] pb-2">Mülk Tercihleri</h4>
                      <div className="bg-[#0A0B0D] p-4 rounded-[6px] border border-[#2A2D35] text-[13px] grid grid-cols-2 gap-y-4 gap-x-4">
                        {selectedLead.properties && Object.entries(selectedLead.properties).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-[#7C8090] block text-[11px] capitalize mb-1">{k.replace(/_/g, ' ')}</span>
                            <span className="font-medium text-[#F1F2F4]">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-[11px] font-medium text-[#7C8090] mb-3 uppercase tracking-wider border-b border-[#2A2D35] pb-2">Eşleşen Mülkler (AI)</h4>
                      <div className="space-y-2">
                        <p className="text-[12px] text-[#4A4E5A] italic">Eşleşen mülk bulunamadı.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#7C8090]">
                  <CheckCircle size={40} className="mb-4 opacity-30 text-[#4A4E5A]" />
                  <p className="font-medium text-[13px]">Detayları görmek için listeden bir lead seçin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color = "text-[#F1F2F4]" }) => (
  <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6 flex flex-col">
    <p className="text-[12px] text-[#7C8090] font-medium mb-2 uppercase tracking-wider">{title}</p>
    <h3 className={`text-[32px] font-mono font-medium ${color}`}>{value}</h3>
  </div>
);

export default OfficeDashboard;
