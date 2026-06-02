import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import { Users, PhoneCall, TrendingUp, Calendar, ChevronRight, Plus, Search, Filter, Phone, Mail, MoreHorizontal, MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw, LogOut, Copy, Check, Menu, Mic, Clock, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import VoiceNote from '../components/VoiceNote';
import VoiceToText from '../components/VoiceToText';
import clsx from 'clsx';
import { format, isToday, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';

const AgentDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [filter, setFilter] = useState('Tümü');
  
  // Analyze Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const [copied, setCopied] = useState(false);

  const { data: leads = [], isLoading: loading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    refetchInterval: 30000
  });

  const { data: leadDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['lead', selectedLeadId],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/${selectedLeadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!selectedLeadId
  });

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/analyze`, {
        name, phone, message
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setName(''); setPhone(''); setMessage('');
      await queryClient.invalidateQueries(['leads']);
      setSelectedLeadId(res.data.id);
    } catch (err) {
      setAnalyzeError(err.response?.data?.message || 'Analiz hatası');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!leadDetails) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/${leadDetails.id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      await queryClient.invalidateQueries(['lead', leadDetails.id]);
      await queryClient.invalidateQueries(['leads']);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReminderChange = async (date) => {
    if (!leadDetails) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/${leadDetails.id}`, { reminder_date: date }, { headers: { Authorization: `Bearer ${token}` } });
      await queryClient.invalidateQueries(['lead', leadDetails.id]);
      await queryClient.invalidateQueries(['leads']);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLeads = filter === 'Tümü' ? leads : leads.filter(l => l.label === filter);
  
  const hotLeads = leads.filter(l => l.label === 'Sıcak').length;
  const warmLeads = leads.filter(l => l.label === 'Ilık').length;
  const coldLeads = leads.filter(l => l.label === 'Soğuk').length;

  const remindersToday = leads.filter(l => l.reminder_date && isToday(new Date(l.reminder_date)));

  const getLabelColorHex = (label) => {
    if (label === 'Sıcak') return '#EF4444';
    if (label === 'Ilık') return '#F5A623';
    return '#3B82F6';
  };

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      
      {/* Sidebar (220px fixed) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Metric Bar */}
        <div className="h-16 flex-shrink-0 border-b border-[#2A2D35] flex items-center justify-between px-6 bg-[#0F1117]">
          <div className="flex items-center space-x-8 h-full">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-2xl font-semibold">{leads.length}</span>
              <span className="text-[#7C8090] text-xs">Bu ay lead</span>
            </div>
            <div className="w-[1px] h-8 bg-[#2A2D35]" />
            <div className="flex items-center space-x-3">
              <span className="font-mono text-2xl font-semibold text-[#EF4444]">{hotLeads}</span>
              <span className="text-[#7C8090] text-xs">Sıcak</span>
            </div>
            <div className="w-[1px] h-8 bg-[#2A2D35]" />
            <div className="flex items-center space-x-3">
              <span className="font-mono text-2xl font-semibold text-[#F5A623]">{warmLeads}</span>
              <span className="text-[#7C8090] text-xs">Ilık</span>
            </div>
            <div className="w-[1px] h-8 bg-[#2A2D35]" />
            <div className="flex items-center space-x-3">
              <span className="font-mono text-2xl font-semibold text-[#3B82F6]">{coldLeads}</span>
              <span className="text-[#7C8090] text-xs">Soğuk</span>
            </div>
          </div>
          
          <button className="flex items-center space-x-2 text-[#7C8090] hover:text-[#F1F2F4] transition-colors text-[13px] font-medium">
            <Activity size={14} />
            <span>Günlük Özet</span>
          </button>
        </div>

        {/* Warning Banner */}
        {remindersToday.length > 0 && (
          <div className="bg-[#2A1A00] border-l-4 border-[#F5A623] py-2 px-6 flex-shrink-0">
            <div className="flex items-center space-x-2 text-[#F5A623] text-xs font-medium">
              <Clock size={14} />
              <span>
                Bugün {remindersToday.length} lead için takip zamanı geldi — {remindersToday.map(l => l.name).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* 3 Columns Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Column 1: New Lead Form (300px) */}
          <div className="w-[300px] flex-shrink-0 border-r border-[#2A2D35] bg-[#0F1117] flex flex-col p-5 overflow-y-auto">
            <h3 className="text-[13px] font-medium text-[#7C8090] mb-5">Yeni lead</h3>
            {analyzeError && <div className="text-red-500 text-xs mb-4">{analyzeError}</div>}
            
            <form onSubmit={handleAnalyze} className="space-y-4 flex-1">
              <div>
                <input 
                  required type="text" placeholder="İsim Soyisim"
                  className="w-full text-[13px] bg-[#0F1117] border border-[#2A2D35] rounded-md px-3 py-2.5 text-[#F1F2F4] placeholder-[#7C8090]"
                  value={name} onChange={e=>setName(e.target.value)} 
                />
              </div>
              <div>
                <input 
                  required type="tel" placeholder="Telefon"
                  className="w-full text-[13px] bg-[#0F1117] border border-[#2A2D35] rounded-md px-3 py-2.5 text-[#F1F2F4] placeholder-[#7C8090]"
                  value={phone} onChange={e=>setPhone(e.target.value)} 
                />
              </div>
              <div>
                <textarea 
                  required rows="5" placeholder="Müşteri mesajı..."
                  className="w-full text-[13px] bg-[#0F1117] border border-[#2A2D35] rounded-md px-3 py-2.5 text-[#F1F2F4] placeholder-[#7C8090] resize-none"
                  value={message} onChange={e=>setMessage(e.target.value)} 
                />
              </div>
              
              <button disabled={analyzing} type="submit" className="w-full bg-[#F5A623] text-[#0F1117] hover:bg-[#d9921e] transition-colors py-2.5 rounded-md text-[13px] font-medium flex items-center justify-center space-x-2 disabled:opacity-50">
                {analyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0F1117]/30 border-t-[#0F1117] rounded-full animate-spin" />
                    <span>Analiz Ediliyor...</span>
                  </>
                ) : (
                  <span>Analiz Et</span>
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#2A2D35]">
              <VoiceToText onLeadCreated={(newLead) => {
                queryClient.invalidateQueries(['leads']);
                setSelectedLeadId(newLead.id);
              }} />
            </div>
          </div>

          {/* Column 2: Lead List (flex-1) */}
          <div className="flex-1 flex flex-col bg-[#0F1117] overflow-hidden border-r border-[#2A2D35]">
            <div className="p-5 border-b border-[#2A2D35]">
              <div className="flex space-x-2">
                {['Tümü', 'Sıcak', 'Ilık', 'Soğuk'].map(f => (
                  <button 
                    key={f} onClick={() => setFilter(f)}
                    className={clsx(
                      "px-3 py-1 text-[11px] font-medium rounded-full uppercase tracking-wider transition-colors", 
                      filter === f ? "bg-[#F5A623] text-[#0F1117]" : "border border-[#2A2D35] text-[#7C8090] hover:text-[#F1F2F4]"
                    )}
                  >
                    {f} {f === 'Tümü' ? leads.length : leads.filter(l=>l.label===f).length}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-[#7C8090] text-[13px]">Yükleniyor...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-[#7C8090] text-[13px]">Henüz kayıt yok.</div>
              ) : (
                <div className="flex flex-col">
                  {filteredLeads.map(lead => {
                    const isSelected = selectedLeadId === lead.id;
                    const colorHex = getLabelColorHex(lead.label);
                    return (
                      <div 
                        key={lead.id} 
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={clsx(
                          "px-5 py-3 border-b border-[#2A2D35] cursor-pointer transition-colors flex items-center group",
                          isSelected ? "bg-[#1A1C23] border-l-2" : "hover:bg-[#1E2028] border-l-2 border-l-transparent"
                        )}
                        style={{ borderLeftColor: isSelected ? '#F5A623' : '' }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full mr-4 flex-shrink-0" style={{backgroundColor: colorHex}} />
                        <div className="w-[140px] truncate text-[13px] text-[#F1F2F4] font-medium">{lead.name}</div>
                        <div className="w-[80px] text-[13px] text-[#7C8090]">{lead.label}</div>
                        <div className="w-[40px] font-mono text-[13px] text-[#F1F2F4]">{lead.score}/10</div>
                        <div className="flex-1 truncate text-[13px] text-[#7C8090]">
                          {lead.properties?.bolge || 'Bölge yok'}
                        </div>
                        <div className="w-[80px] text-right text-[12px] text-[#7C8090]">
                          {isToday(new Date(lead.created_at)) ? 'Bugün' : format(new Date(lead.created_at), 'd MMM')}
                        </div>
                        <ChevronRight size={14} className={clsx("ml-2 transition-colors", isSelected ? "text-[#F5A623]" : "text-transparent group-hover:text-[#7C8090]")} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Lead Detail (380px) */}
          <div className="w-[380px] flex-shrink-0 bg-[#16181D] overflow-y-auto flex flex-col relative">
            {!selectedLeadId ? (
              <div className="flex-1 flex items-center justify-center text-[#7C8090] text-[13px]">
                Detay için bir lead seçin
              </div>
            ) : detailsLoading || !leadDetails ? (
              <div className="flex-1 flex items-center justify-center text-[#7C8090] text-[13px]">
                Yükleniyor...
              </div>
            ) : (
              <div className="p-6">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-[18px] font-medium text-[#F1F2F4]">{leadDetails.name}</h2>
                    <p className="text-[13px] text-[#7C8090] mt-0.5">{leadDetails.phone}</p>
                    
                    {/* Status Select */}
                    <select 
                      className="mt-3 text-[12px] bg-[#0F1117] border border-[#2A2D35] text-[#F1F2F4] rounded-md px-2 py-1 outline-none focus:border-[#F5A623]"
                      value={leadDetails.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="Takipte">Takipte</option>
                      <option value="Arandı">Arandı</option>
                      <option value="Randevu Alındı">Randevu Alındı</option>
                      <option value="Satış Tamamlandı">Satış Tamamlandı</option>
                    </select>

                  </div>
                  
                  {/* Score */}
                  <div className="relative w-[72px] h-[72px] flex items-center justify-center flex-shrink-0">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="36" cy="36" r="32" fill="none" stroke="#2A2D35" strokeWidth="4" />
                      <circle cx="36" cy="36" r="32" fill="none" 
                        stroke={getLabelColorHex(leadDetails.label)} 
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${(leadDetails.score/10)*201} 201`}
                        className="score-circle transition-all duration-1000" />
                    </svg>
                    <div className="flex items-baseline">
                      <span className="font-mono text-[24px] font-semibold" style={{color: getLabelColorHex(leadDetails.label)}}>{leadDetails.score}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[13px] text-[#7C8090] italic">"{leadDetails.reasoning}"</p>
                </div>

                <hr className="border-[#2A2D35] mb-6" />

                {/* Property Preferences */}
                {leadDetails.properties && (
                  <div className="mb-6">
                    <h4 className="text-[11px] uppercase tracking-wider font-medium text-[#7C8090] mb-3">Mülk Tercihleri</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries({
                        'Bölge': leadDetails.properties.bolge,
                        'Tip': leadDetails.properties.tip,
                        'Oda': leadDetails.properties.oda,
                        'Bütçe': leadDetails.properties.butce,
                      }).map(([k, v]) => v ? (
                        <div key={k} className="bg-[#0F1117] border border-[#2A2D35] rounded-md px-3 py-2">
                          <div className="text-[10px] text-[#7C8090] uppercase tracking-wider mb-0.5">{k}</div>
                          <div className="text-[12px] font-medium text-[#F1F2F4] truncate">{v}</div>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                )}

                {/* Voice Note */}
                <div className="mb-6">
                   <h4 className="text-[11px] uppercase tracking-wider font-medium text-[#7C8090] mb-3">Sesli Not</h4>
                   <VoiceNote leadId={selectedLeadId} onSaved={() => queryClient.invalidateQueries(['lead', selectedLeadId])} />
                </div>

                {/* WhatsApp */}
                <div className="mb-6">
                  <h4 className="text-[11px] uppercase tracking-wider font-medium text-[#7C8090] mb-3">WhatsApp Yanıtı</h4>
                  <div className="bg-[#0F1117] border border-[#2A2D35] rounded-lg p-3">
                    <p className="text-[13px] text-[#F1F2F4] leading-relaxed mb-4">
                      {leadDetails.whatsapp_draft || 'Taslak bulunamadı.'}
                    </p>
                    <div className="flex items-center space-x-3">
                      <a 
                        href={`https://wa.me/${leadDetails.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(leadDetails.whatsapp_draft || '')}`}
                        target="_blank" rel="noreferrer"
                        className="text-[#25D366] text-[12px] font-medium flex items-center space-x-1 hover:opacity-80"
                      >
                        <Send size={12} />
                        <span>WhatsApp'ta Aç</span>
                      </a>
                      <button 
                        onClick={() => copyToClipboard(leadDetails.whatsapp_draft || '')}
                        className="text-[#7C8090] hover:text-[#F1F2F4] text-[12px] font-medium flex items-center space-x-1"
                      >
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AgentDashboard;
