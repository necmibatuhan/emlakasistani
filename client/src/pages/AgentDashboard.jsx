import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import VoiceNoteModal from '../components/VoiceNoteModal';
import LeadCard from '../components/LeadCard';
import RemindersWidget from '../components/RemindersWidget';
import ExternalListingCard from '../components/ExternalListingCard';
import clsx from 'clsx';
import { format, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import ActionCenter from '../components/ActionCenter';
import AgendaView from '../components/AgendaView';
import PricingModal from '../components/PricingModal';

const AgentDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [activeTab, setActiveTab] = useState('Sıcak');
  
  // Analyze Form (Slide-over)
  const [isNewLeadDrawerOpen, setIsNewLeadDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  // Voice Note Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Success Tick Animation
  const [showSuccessTick, setShowSuccessTick] = useState(false);

  // Pricing Modal State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(user?.plan || 'free');

  const handleUpgradeSuccess = (newPlan) => {
    setCurrentPlan(newPlan);
    setShowSuccessTick(true);
    setTimeout(() => setShowSuccessTick(false), 3000);
  };

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

  React.useEffect(() => {
    const handleOpenDrawer = () => setIsNewLeadDrawerOpen(true);
    window.addEventListener('open-new-lead-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-new-lead-drawer', handleOpenDrawer);
  }, []);

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

  const { data: externalMatches } = useQuery({
    queryKey: ['externalMatches', selectedLeadId],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/${selectedLeadId}/external-matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!selectedLeadId
  });

  const handleNewLeadClick = () => {
    setSelectedLeadId(null);
    setName('');
    setPhone('');
    setMessage('');
    setIsNewLeadDrawerOpen(true);
  };

  const handleEditClick = () => {
    if (!leadDetails) return;
    setName(leadDetails.name === '[İsim Belirtilmedi]' ? '' : leadDetails.name);
    setPhone(leadDetails.phone === '[Telefon Belirtilmedi]' ? '' : leadDetails.phone);
    setMessage(leadDetails.message || '');
    setIsNewLeadDrawerOpen(true);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      let res;
      if (selectedLeadId) {
        // Düzenleme (Update)
        res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/${selectedLeadId}/analyze`, {
          name, phone, message
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // Yeni Lead Ekleme
        res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/analyze`, {
          name, phone, message
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      setName(''); setPhone(''); setMessage('');
      await queryClient.invalidateQueries(['leads']);
      setSelectedLeadId(res.data.id);
      setIsNewLeadDrawerOpen(false);
      setShowSuccessTick(true);
      setTimeout(() => setShowSuccessTick(false), 2000);
    } catch (err) {
      setAnalyzeError(err.response?.data?.message || 'Analiz hatası');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVoiceNoteComplete = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voicenote.webm');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/voice/transcribe`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(prev => prev ? prev + '\n' + res.data.transcript : res.data.transcript);
      setIsVoiceModalOpen(false);
      setIsNewLeadDrawerOpen(true);
    } catch (err) {
      console.error(err);
      alert('Ses metne çevrilemedi.');
    }
  };

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleWakeUp = async (leadId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/${leadId}/wakeup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await queryClient.invalidateQueries(['leads']);
      if (selectedLeadId === leadId) {
        await queryClient.invalidateQueries(['lead', leadId]);
      }
      setShowSuccessTick(true);
      setTimeout(() => setShowSuccessTick(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Yapay zeka uyanma mesajını oluşturamadı.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    const previousLeads = queryClient.getQueryData(['leads']);
    const targetLead = previousLeads.find(l => l.id === leadId);
    if (!targetLead || targetLead.label === newStatus) return;

    // Optimistic Update
    queryClient.setQueryData(['leads'], old => old.map(l => l.id === leadId ? { ...l, label: newStatus } : l));
    
    // Play success animation
    setShowSuccessTick(true);
    setTimeout(() => setShowSuccessTick(false), 1500);

    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/${leadId}`, { label: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      queryClient.setQueryData(['leads'], previousLeads);
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Sıcak') return 'var(--color-status-hot)';
    if (status === 'Ilık') return 'var(--color-status-warm)';
    return 'var(--color-status-cold)';
  };

  const getStatusBgColor = (status) => {
    if (status === 'Sıcak') return 'bg-status-hot/10 border-status-hot/30 text-status-hot';
    if (status === 'Ilık') return 'bg-status-warm/10 border-status-warm/30 text-status-warm';
    return 'bg-status-cold/10 border-status-cold/30 text-status-cold';
  };

  const hotLeads = leads.filter(l => l.label === 'Sıcak').length;
  const warmLeads = leads.filter(l => l.label === 'Ilık').length;
  const coldLeads = leads.filter(l => l.label === 'Soğuk').length;
  const remindersToday = leads.filter(l => l.reminder_date && isToday(new Date(l.reminder_date)));

  return (
    <div className="flex min-h-screen bg-background"> {/* Premium Fintech Background */}
      <Sidebar />

      <div className="lg:ml-[240px] flex-1 flex flex-col h-screen w-full overflow-hidden">
        <Header />

        {/* Alert Banner */}
        {remindersToday.length > 0 && (
          <div className="w-full bg-status-warm/10 border-b border-status-warm px-6 py-2 flex items-center gap-3 shrink-0">
            <span className="material-symbols-outlined text-status-warm" style={{fontVariationSettings: "'FILL' 1"}}>alarm</span>
            <p className="font-medium text-sm text-on-surface">⏰ Bugün {remindersToday.length} lead için takip zamanı — {remindersToday.map(l => l.name).join(', ')}</p>
          </div>
        )}

        <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          
          {/* Top Banner for Plan */}
          <div className="w-full bg-[#16181D] border border-[#2A2D35] rounded-xl px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-[20px]">diamond</span>
              </div>
              <div>
                <h3 className="text-[#F1F2F4] font-bold text-sm">Mevcut Planınız: <span className="text-[#F5A623] uppercase tracking-wider ml-1">{currentPlan === 'free' ? 'ÜCRETSİZ BAŞLANGIÇ' : currentPlan}</span></h3>
                <p className="text-[#7C8090] text-xs mt-0.5">Daha fazla özellik için planınızı yükseltin.</p>
              </div>
            </div>
            {currentPlan !== 'proplus' && (
              <button 
                onClick={() => setIsPricingModalOpen(true)}
                className="bg-[#F5A623] hover:bg-[#d9921e] text-[#0A0B0D] font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(245,166,35,0.2)]"
              >
                Planı Yükselt
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
            <div className="lg:col-span-2">
              {/* AI Action Center (Günün Komutları) */}
              <ActionCenter leads={leads} onActionClick={(action) => {
                if (action.leadId) setSelectedLeadId(action.leadId);
              }} />
            </div>
            <div className="h-[280px]">
              {/* AI Takvim Görevleri / Hatırlatıcılar */}
              <AgendaView leads={leads} />
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto shrink-0 pb-2 border-b border-outline-variant">
            {['Sıcak', 'Ilık', 'Soğuk'].map(status => (
              <button 
                key={status} 
                onClick={() => setActiveTab(status)} 
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors", 
                  activeTab === status ? getStatusBgColor(status) : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                )}
              >
                {status} ({leads.filter(l => l.label === status).length})
              </button>
            ))}
          </div>

          {/* Kanban Board Container (Drag and Drop) */}
          <DragDropContext onDragEnd={(result) => {
            const { destination, source, draggableId } = result;
            if (!destination) return;
            if (destination.droppableId === source.droppableId && destination.index === source.index) return;
            
            const newStatus = destination.droppableId;
            const leadId = draggableId;
            
            const previousLeads = queryClient.getQueryData(['leads']);
            const targetLead = previousLeads.find(l => l.id === leadId);
            if (!targetLead || targetLead.label === newStatus) return;

            // Optimistic Update
            queryClient.setQueryData(['leads'], old => {
               const newLeads = Array.from(old);
               const idx = newLeads.findIndex(l => l.id === leadId);
               newLeads[idx] = { ...newLeads[idx], label: newStatus };
               return newLeads;
            });
            
            setShowSuccessTick(true);
            setTimeout(() => setShowSuccessTick(false), 1500);

            axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/${leadId}`, { label: newStatus }, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {
              queryClient.setQueryData(['leads'], previousLeads);
            });
          }}>
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 pb-4">
               {['Sıcak', 'Ilık', 'Soğuk'].map(status => (
                  <div 
                    key={status} 
                    className={clsx(
                      "w-full md:w-[340px] shrink-0 flex flex-col bg-surface-container-low rounded-xl border border-outline-variant h-full shadow-2xl",
                      "md:flex",
                      activeTab === status ? "flex" : "hidden"
                    )} 
                  >
                    {/* Column Header */}
                    <div className="p-4 border-b border-outline-variant flex items-center justify-between shrink-0 bg-surface-container/50 rounded-t-xl">
                       <h3 className="font-semibold text-on-surface flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{backgroundColor: getStatusColor(status), color: getStatusColor(status)}}></span>
                          {status}
                       </h3>
                       <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full border border-outline">
                         {leads.filter(l => l.label === status).length}
                       </span>
                    </div>
                    
                    {/* Column Body (Cards) */}
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={clsx(
                            "p-3 flex-1 overflow-y-auto flex flex-col gap-3 custom-scrollbar transition-colors",
                            snapshot.isDraggingOver ? "bg-primary/5" : ""
                          )}
                        >
                           {loading && <p className="text-on-surface-variant text-sm text-center mt-4">Yükleniyor...</p>}
                           {!loading && leads.filter(l => l.label === status).length === 0 && (
                             <div className="flex flex-col items-center justify-center h-32 opacity-50 border border-dashed border-outline rounded-lg mt-2">
                               <span className="material-symbols-outlined text-on-surface-variant text-2xl mb-1">inbox</span>
                               <p className="text-on-surface-variant text-sm text-center">Lead yok</p>
                             </div>
                           )}
                           
                           {leads.filter(l => l.label === status).map((lead, index) => (
                              <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                {(provided, snapshot) => (
                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={clsx(
                                      "transition-all relative group",
                                      snapshot.isDragging ? "z-50 scale-105" : "",
                                      selectedLeadId === lead.id && !snapshot.isDragging ? "ring-2 ring-primary/50 rounded-xl" : ""
                                    )}
                                  >
                                    <LeadCard 
                                      name={lead.name === '[İsim Belirtilmedi]' ? 'İsimsiz Lead' : lead.name}
                                      phone={lead.phone === '[Telefon Belirtilmedi]' ? 'Telefon Yok' : lead.phone}
                                      score={lead.score ? lead.score * 10 : 50} 
                                      urgency={lead.score >= 8 ? 'high' : lead.score >= 5 ? 'medium' : 'low'}
                                      summary={lead.reasoning || lead.whatsapp_draft || 'Özet bekleniyor...'}
                                      onClick={() => setSelectedLeadId(lead.id)}
                                      redFlag={(() => {
                                        try {
                                          const p = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
                                          return p?.potential_risks && p.potential_risks.length > 0;
                                        } catch(e) { return false; }
                                      })()}
                                      redFlagReason={(() => {
                                        try {
                                          const p = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
                                          return p?.potential_risks?.join(', ') || null;
                                        } catch(e) { return null; }
                                      })()}
                                      actionType={(() => {
                                        try {
                                          const p = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
                                          return p?.customer_intent === 'buyer' || p?.customer_intent === 'investor' ? 'sale' : 'rent';
                                        } catch(e) { return 'unknown'; }
                                      })()}
                                      budgetStr={(() => {
                                        try {
                                          const p = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
                                          return p?.budget?.max ? `${p.budget.min || 0} - ${p.budget.max} ${p.budget.currency || 'TRY'}` : 'Bütçe Belirsiz';
                                        } catch(e) { return 'Bütçe Belirsiz'; }
                                      })()}
                                      roomCount={(() => {
                                        try {
                                          const p = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
                                          if (p?.room_count?.min) return `${p.room_count.min}${p.room_count.max ? '-'+p.room_count.max : ''} Oda`;
                                          return 'Bilinmiyor';
                                        } catch(e) { return 'Bilinmiyor'; }
                                      })()}
                                      whatsappDraft={lead.whatsapp_draft}
                                      onWakeUp={() => handleWakeUp(lead.id)}
                                    />
                                  </div>
                                )}
                              </Draggable>
                           ))}
                           {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
               ))}
            </div>
          </DragDropContext>

        </div>
      </div>

      {/* Slide-over Detail Pane (Glassmorphism) */}
      {selectedLeadId && leadDetails && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSelectedLeadId(null)}></div>
          <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-surface-container-low/95 backdrop-blur-2xl border-l border-outline-variant shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col transform transition-transform duration-300 ease-out">
            <div className="p-6 border-b border-outline-variant/50 flex justify-between items-start shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container border border-outline flex items-center justify-center text-xl font-bold text-on-surface shadow-inner">
                  {leadDetails.name === '[İsim Belirtilmedi]' ? '?' : leadDetails.name?.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface leading-tight">
                    {leadDetails.name === '[İsim Belirtilmedi]' ? 'İsimsiz Lead' : leadDetails.name}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {format(new Date(leadDetails.created_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedLeadId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-outline-variant transition-colors border border-outline">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
              
              {/* Score and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container/80 border border-outline/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                   <div className="relative w-16 h-16 flex items-center justify-center">
                     <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 88 88">
                       <circle cx="44" cy="44" fill="none" r="40" stroke="var(--color-outline-variant)" strokeWidth="6"></circle>
                       <circle 
                         className="transition-all duration-1000 ease-out" 
                         cx="44" cy="44" fill="none" r="40" 
                         stroke={getStatusColor(leadDetails.label)} 
                         strokeDasharray="251.2" 
                         strokeDashoffset={251.2 - (251.2 * (leadDetails.score || 5) / 10)} 
                         strokeWidth="6"
                         strokeLinecap="round"
                         style={{ filter: `drop-shadow(0 0 4px ${getStatusColor(leadDetails.label)}80)` }}
                       ></circle>
                     </svg>
                     <span className="text-lg font-bold text-on-surface relative z-10">{leadDetails.score || 5}</span>
                   </div>
                   <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">Lead Skoru</span>
                </div>
                <div className="bg-surface-container/80 border border-outline/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                   <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-1 border shadow-lg", getStatusBgColor(leadDetails.label))}>
                     <span className="material-symbols-outlined text-[28px]">{leadDetails.label === 'Sıcak' ? 'local_fire_department' : leadDetails.label === 'Ilık' ? 'thermostat' : 'ac_unit'}</span>
                   </div>
                   <span className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase">Durum</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {leadDetails.phone && leadDetails.phone !== '[Telefon Belirtilmedi]' ? (
                  <a 
                    href={`https://wa.me/${leadDetails.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" rel="noreferrer"
                    className="w-full bg-gradient-to-r from-[#25D366] to-[#1da851] text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.2)] hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    WhatsApp'ta Görüş
                  </a>
                ) : (
                  <button disabled className="w-full bg-surface-container-high text-on-surface-variant px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-outline">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    Telefon Numarası Yok
                  </button>
                )}
                <button onClick={handleEditClick} className="w-full bg-transparent border border-outline hover:border-primary hover:text-primary text-on-surface px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                  Bilgileri Düzenle
                </button>
              </div>

              {/* Preferences */}
              {leadDetails.tags && leadDetails.tags.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-3 border-b border-outline-variant pb-2">Müşteri Tercihleri</h4>
                  <div className="flex flex-wrap gap-2">
                    {leadDetails.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-surface-container border border-outline shadow-sm rounded-lg text-[13px] text-on-surface font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message / Summary */}
              <div className="mb-4">
                <h4 className="text-[11px] font-bold text-on-surface-variant tracking-wider uppercase mb-3 border-b border-outline-variant pb-2">Analiz Özeti / Notlar</h4>
                <div className="bg-surface-container/80 border border-outline/50 rounded-xl p-4 shadow-inner relative">
                  <p className="text-[14px] text-on-surface-variant leading-relaxed italic relative z-10">
                    "{leadDetails.reasoning || leadDetails.message || leadDetails.summary || leadDetails.original_message || 'Not eklenmemiş.'}"
                  </p>
                </div>
              </div>

              {/* External Matches (Ters Eşleşme) */}
              {externalMatches && externalMatches.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase mb-3 border-b border-outline-variant pb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">radar</span>
                    Dış Havuz Eşleşmeleri (Ters Eşleşme)
                  </h4>
                  <div className="flex flex-col gap-3">
                    {externalMatches.map(match => (
                      <ExternalListingCard key={match.id} listing={match} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        <button 
          onClick={() => setIsVoiceModalOpen(true)} 
          className="w-14 h-14 bg-[#1C1E24] border border-[#2A2D35] rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center hover:scale-110 hover:border-[#3B82F6] hover:text-[#3B82F6] text-[#F1F2F4] transition-all group"
          title="Sesli Not Ekle"
        >
          <span className="material-symbols-outlined text-[24px]">mic</span>
        </button>
        <button 
          onClick={handleNewLeadClick} 
          className="w-14 h-14 bg-gradient-to-br from-[#F5A623] to-[#d48c1a] rounded-full shadow-[0_8px_16px_rgba(245,166,35,0.3)] flex items-center justify-center hover:scale-110 hover:shadow-[0_12px_24px_rgba(245,166,35,0.5)] transition-all"
          title="Yeni Lead Ekle"
        >
          <span className="material-symbols-outlined text-black font-bold text-[28px]">add</span>
        </button>
      </div>

      {/* Slide-over Drawer for New Lead */}
      {isNewLeadDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsNewLeadDrawerOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#12141A] border-l border-[#2A2D35] shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
            <div className="p-6 border-b border-[#2A2D35] flex justify-between items-center bg-[#16181D]">
              <h2 className="text-xl font-bold text-[#F1F2F4]">{selectedLeadId ? 'Bilgileri Düzenle' : 'Yeni Lead Ekle'}</h2>
              <button onClick={() => setIsNewLeadDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C1E24] text-[#8E929C] hover:text-white border border-[#2A2D35]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
              {analyzeError && <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] rounded-lg text-sm">{analyzeError}</div>}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#8E929C] uppercase tracking-wider">Müşteri Adı</label>
                <input 
                  className="bg-[#1C1E24] border border-[#2A2D35] text-[#F1F2F4] p-3 rounded-xl focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all" 
                  placeholder="Ad Soyad" 
                  type="text"
                  value={name} onChange={e=>setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#8E929C] uppercase tracking-wider">Telefon</label>
                <input 
                  className="bg-[#1C1E24] border border-[#2A2D35] text-[#F1F2F4] p-3 rounded-xl focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all" 
                  placeholder="+90 5XX XXX XX XX" 
                  type="tel"
                  value={phone} onChange={e=>setPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[13px] font-bold text-[#8E929C] uppercase tracking-wider flex items-center justify-between">
                  <span>Mesaj / Not (AI Analizi)</span>
                  <button onClick={() => { setIsNewLeadDrawerOpen(false); setIsVoiceModalOpen(true); }} className="text-[#3B82F6] hover:text-[#60A5FA] flex items-center gap-1 normal-case text-xs">
                    <span className="material-symbols-outlined text-[14px]">mic</span>
                    Sesli Söyle
                  </button>
                </label>
                <textarea 
                  className="bg-[#1C1E24] border border-[#2A2D35] text-[#F1F2F4] p-3 rounded-xl flex-1 resize-none focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all" 
                  placeholder="Müşterinin talebini detaylıca yazın, yapay zeka analiz edip puanlasın..."
                  value={message} onChange={e=>setMessage(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-[#2A2D35] bg-[#16181D]">
              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-[#F5A623] to-[#d48c1a] text-black font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_12px_rgba(245,166,35,0.2)] hover:shadow-[0_6px_16px_rgba(245,166,35,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin-custom">sync</span>
                    Yapay Zeka Analiz Ediyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Kaydet ve Analiz Et
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Tick Animation Overlay */}
      {showSuccessTick && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-[#10B981]/20 border border-[#10B981]/50 backdrop-blur-md text-[#10B981] p-6 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-bounce-custom flex flex-col items-center">
            <span className="material-symbols-outlined text-[64px] mb-2">check_circle</span>
            <span className="font-bold text-lg">İşlem Başarılı!</span>
          </div>
        </div>
      )}

      {/* Pricing / Upgrade Modal */}
      <PricingModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
        token={token} 
        onUpgradeSuccess={handleUpgradeSuccess} 
      />

      <VoiceNoteModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
        onRecordingComplete={handleVoiceNoteComplete} 
      />
    </div>
  );
};

export default AgentDashboard;
