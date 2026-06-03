import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import VoiceNoteModal from '../components/VoiceNoteModal';
import clsx from 'clsx';
import { format, isToday } from 'date-fns';
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

  // Voice Note Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

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
    if (e) e.preventDefault();
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

  const handleVoiceNoteComplete = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/voice`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await queryClient.invalidateQueries(['leads']);
      setSelectedLeadId(res.data.id);
    } catch (err) {
      console.error(err);
      alert('Sesli not analiz hatası.');
    }
  };

  const filteredLeads = filter === 'Tümü' ? leads : leads.filter(l => l.label === filter);
  
  const hotLeads = leads.filter(l => l.label === 'Sıcak').length;
  const warmLeads = leads.filter(l => l.label === 'Ilık').length;
  const coldLeads = leads.filter(l => l.label === 'Soğuk').length;

  const remindersToday = leads.filter(l => l.reminder_date && isToday(new Date(l.reminder_date)));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="ml-[240px] flex-1 flex flex-col h-full bg-[#0A0B0D]">
        <Header />

        {/* Alert Banner */}
        {remindersToday.length > 0 && (
          <div className="w-full bg-[#2A1A00] border-b border-[#F5A623] px-container-padding py-stack-sm flex items-center gap-stack-sm shrink-0">
            <span className="material-symbols-outlined text-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>alarm</span>
            <p className="font-body-md text-body-md text-on-surface">⏰ Bugün {remindersToday.length} lead için takip zamanı — {remindersToday.map(l => l.name).join(', ')}</p>
          </div>
        )}

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-container-padding flex flex-col gap-container-padding">
          
          {/* Top Metric Bar */}
          <div className="panel flex items-center justify-between p-stack-md shrink-0">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-unit">BU AY LEAD</span>
              <span className="font-data-tabular text-[24px] font-medium leading-none text-on-surface">{leads.length}</span>
            </div>
            <div className="h-8 w-px divider border-l"></div>
            <div className="flex flex-col items-center">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-unit">SICAK</span>
              <span className="font-data-tabular text-[24px] font-medium leading-none text-error">{hotLeads}</span>
            </div>
            <div className="h-8 w-px divider border-l"></div>
            <div className="flex flex-col items-center">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-unit">ILIK</span>
              <span className="font-data-tabular text-[24px] font-medium leading-none text-primary">{warmLeads}</span>
            </div>
            <div className="h-8 w-px divider border-l"></div>
            <div className="flex flex-col items-end">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-unit">SOĞUK</span>
              <span className="font-data-tabular text-[24px] font-medium leading-none text-tertiary">{coldLeads}</span>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className="flex-1 flex gap-panel-gap min-h-0">
            
            {/* Left Column (New Lead Form) */}
            <div className="w-[300px] panel flex flex-col shrink-0">
              <div className="p-stack-md border-b divider shrink-0">
                <h2 className="font-headline-md text-headline-md font-medium">Yeni lead</h2>
              </div>
              <div className="p-stack-md flex-1 overflow-y-auto flex flex-col gap-stack-md">
                {analyzeError && <p className="text-error text-sm">{analyzeError}</p>}
                <div className="flex flex-col gap-unit">
                  <label className="font-body-sm text-body-sm text-on-surface-variant">Müşteri Adı</label>
                  <input 
                    className="input-dark p-2 text-sm w-full" 
                    placeholder="Ad Soyad" 
                    type="text"
                    value={name} onChange={e=>setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-unit">
                  <label className="font-body-sm text-body-sm text-on-surface-variant">Telefon</label>
                  <input 
                    className="input-dark p-2 text-sm w-full" 
                    placeholder="+90 5XX XXX XX XX" 
                    type="tel"
                    value={phone} onChange={e=>setPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-unit flex-1">
                  <label className="font-body-sm text-body-sm text-on-surface-variant">Mesaj / Not</label>
                  <textarea 
                    className="input-dark p-2 text-sm w-full flex-1 resize-none min-h-[100px]" 
                    placeholder="Lead detayları..."
                    value={message} onChange={e=>setMessage(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="p-stack-md border-t divider flex flex-col gap-stack-sm shrink-0">
                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-[#F5A623] hover:bg-[#d48c1a] text-black font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {analyzing ? 'Analiz Ediliyor...' : 'Analiz Et'}
                </button>
                <button 
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="w-full bg-transparent border border-[#2A2D35] hover:bg-[#1C1E24] text-[#F1F2F4] font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">mic</span>
                  Sesli not
                </button>
              </div>
            </div>

            {/* Middle Column (Lead List) */}
            <div className="flex-1 panel flex flex-col min-w-[320px]">
              <div className="p-stack-md border-b divider shrink-0 flex gap-stack-sm overflow-x-auto">
                {['Tümü', 'Sıcak', 'Ilık', 'Soğuk'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={clsx(
                      "px-3 py-1 rounded text-sm whitespace-nowrap transition-colors",
                      filter === f 
                        ? "bg-surface-container-high text-on-surface" 
                        : "bg-transparent border border-outline-variant hover:bg-surface-container-high text-on-surface-variant"
                    )}
                  >
                    {f} {f === 'Tümü' ? leads.length : leads.filter(l=>l.label===f).length}
                  </button>
                ))}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-[1fr_auto] gap-4 p-stack-sm px-stack-md border-b divider bg-[#1C1E24] sticky top-0 font-label-caps text-label-caps text-on-surface-variant">
                  <div>Müşteri / İletişim</div>
                  <div className="text-right">Durum</div>
                </div>
                
                {loading && <div className="p-8 text-center text-on-surface-variant text-sm">Yükleniyor...</div>}
                {!loading && filteredLeads.length === 0 && <div className="p-8 text-center text-on-surface-variant text-sm">Lead bulunamadı.</div>}
                
                {filteredLeads.map(lead => (
                  <div 
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={clsx(
                      "grid grid-cols-[1fr_auto] gap-4 p-stack-sm px-stack-md border-b divider hover:bg-[#1a1c22] cursor-pointer",
                      selectedLeadId === lead.id ? "bg-[#1e2025]" : ""
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">{lead.name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{lead.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        lead.label === 'Sıcak' ? "bg-error" : lead.label === 'Ilık' ? "bg-primary" : "bg-tertiary"
                      )}></div>
                      <span className={clsx(
                        "font-body-sm text-body-sm",
                        lead.label === 'Sıcak' ? "text-error" : lead.label === 'Ilık' ? "text-primary" : "text-tertiary"
                      )}>{lead.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (Lead Detail) */}
            <div className="w-[380px] panel flex flex-col shrink-0">
              {!selectedLeadId || detailsLoading ? (
                <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm p-8 text-center">
                  {detailsLoading ? 'Detaylar yükleniyor...' : 'Detayları görmek için bir lead seçin.'}
                </div>
              ) : leadDetails ? (
                <>
                  <div className="p-stack-md border-b divider shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-stack-sm">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-lg font-medium text-on-surface">
                        {leadDetails.name?.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md font-medium leading-tight text-on-surface">{leadDetails.name}</h3>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Oluşturulma: {format(new Date(leadDetails.created_at), 'dd MMM HH:mm', { locale: tr })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-stack-md flex flex-col gap-stack-lg">
                    {/* Score Ring */}
                    <div className="flex flex-col items-center justify-center gap-stack-sm">
                      <div className="relative w-[88px] h-[88px] flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 88 88">
                          <circle cx="44" cy="44" fill="none" r="40" stroke="#2A2D35" strokeWidth="8"></circle>
                          <circle 
                            className="score-circle transition-all duration-1000 ease-out" 
                            cx="44" cy="44" fill="none" r="40" 
                            stroke={leadDetails.label === 'Sıcak' ? '#EF4444' : leadDetails.label === 'Ilık' ? '#F5A623' : '#3B82F6'} 
                            strokeDasharray="251.2" 
                            strokeDashoffset={251.2 - (251.2 * (leadDetails.score || 5) / 10)} 
                            strokeWidth="8"
                          ></circle>
                        </svg>
                        <span className="font-data-tabular text-xl font-bold text-on-surface relative z-10">{leadDetails.score || 5}/10</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">ALIM İHTİMALİ</span>
                    </div>

                    {/* WhatsApp Action */}
                    <div className="flex flex-col gap-stack-sm">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">İLETİŞİM</span>
                      <div className="bg-[#1C1E24] border border-[#2A2D35] rounded p-stack-sm flex items-center justify-between">
                        <span className="font-body-md text-body-md text-on-surface">{leadDetails.phone || 'Telefon yok'}</span>
                        {leadDetails.phone && (
                          <a 
                            href={`https://wa.me/${leadDetails.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" rel="noreferrer"
                            className="bg-[#25D366] text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 hover:bg-[#20b858] transition-colors"
                          >
                            WhatsApp'ta Aç
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Property Preferences */}
                    {leadDetails.tags && leadDetails.tags.length > 0 && (
                      <div className="flex flex-col gap-stack-sm">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">TERCİHLER</span>
                        <div className="flex flex-wrap gap-2">
                          {leadDetails.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-surface-container-high border border-outline-variant rounded text-sm text-on-surface">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Voice Note / Message Preview */}
                    <div className="flex flex-col gap-stack-sm mt-auto">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">MÜŞTERİ NOTU</span>
                      <div className="bg-[#1C1E24] border border-[#2A2D35] rounded p-stack-sm">
                        <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                          "{leadDetails.summary || leadDetails.original_message || 'Not eklenmemiş.'}"
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <VoiceNoteModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
        onRecordingComplete={handleVoiceNoteComplete} 
      />
    </div>
  );
};

export default AgentDashboard;
