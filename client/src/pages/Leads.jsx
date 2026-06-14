import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const MOCK_LEADS = [
  {
    id: 1,
    name: "Ayşe Kaya",
    phone: "+90 532 111 22 33",
    label: "Sıcak",
    score: 8,
    region: "Kadıköy",
    type: "3+1",
    time: "Bugün",
    isReminder: true,
    message: "Kadıköy'de 3+1 arıyorum, bütçem 5M TL. Peşin ödeyeceğim, acil.",
    aiReason: "Bütçe net (4-5M TL), aciliyet yüksek, peşin.",
    history: [
      { id: 1, icon: "✦", text: "Lead oluşturuldu", date: "14 Haz 2026, 09:12", iconColor: "text-[#7C8090]" },
      { id: 2, icon: "●", text: "Durum: Arandı", date: "14 Haz 2026, 14:30", iconColor: "text-blue-500" },
      { id: 3, icon: "🎙️", text: "Sesli not eklendi", date: "14 Haz 2026, 14:32", iconColor: "text-[#F1F2F4]" },
      { id: 4, icon: "📅", text: "Randevu: 20 Haz", date: "14 Haz 2026, 14:33", iconColor: "text-[#10B981]" }
    ],
    notes: [
      { id: 1, type: "voice", time: "Bugün 14:32", content: "Az önce aradım, Cuma sabah müsait...", aiSummary: "Randevu Cuma, sabah saatleri." },
      { id: 2, type: "text", time: "Dün 11:15", content: "Bütçesini 5.5M'ye çıkarabilirmiş." }
    ],
    preferences: [
      { label: "Bölge", value: "Kadıköy" },
      { label: "Tip", value: "Satılık" },
      { label: "Oda", value: "3+1" },
      { label: "Bütçe", value: "4-5M₺" },
      { label: "Aciliyet", value: "Acil" }
    ]
  },
  {
    id: 2,
    name: "Mehmet Demir",
    phone: "+90 533 222 55 66",
    label: "Ilık",
    score: 5,
    region: "Şişli",
    type: "2+1",
    time: "2 gün",
    isReminder: false,
    message: "Şişli'de yatırım amaçlı 2+1 bakıyorum. Krediye uygun olmalı.",
    aiReason: "Yatırım amaçlı, bütçe tam netleşmemiş, kredi süreci var.",
    history: [
      { id: 1, icon: "✦", text: "Lead oluşturuldu", date: "12 Haz 2026, 10:00", iconColor: "text-[#7C8090]" }
    ],
    notes: [],
    preferences: [
      { label: "Bölge", value: "Şişli" },
      { label: "Tip", value: "Satılık" },
      { label: "Oda", value: "2+1" },
      { label: "Amac", value: "Yatırım" }
    ]
  },
  {
    id: 3,
    name: "Ali Yıldız",
    phone: "+90 530 999 00 11",
    label: "Soğuk",
    score: 2,
    region: "Belirsiz",
    type: "",
    time: "1 hafta",
    isReminder: false,
    message: "Merhabalar, piyasa araştırması yapıyorum, henüz karar vermedim.",
    aiReason: "Araştırma aşamasında, aciliyet yok, spesifik talep yok.",
    history: [
      { id: 1, icon: "✦", text: "Lead oluşturuldu", date: "07 Haz 2026, 16:45", iconColor: "text-[#7C8090]" }
    ],
    notes: [],
    preferences: [
      { label: "Durum", value: "Araştırma" }
    ]
  }
];

const getLabelStyle = (label) => {
  switch (label) {
    case 'Sıcak': return { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]', stroke: '#EF4444' };
    case 'Ilık': return { bg: 'bg-[#F5A623]/10', text: 'text-[#F5A623]', dot: 'bg-[#F5A623]', stroke: '#F5A623' };
    case 'Soğuk': return { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]', stroke: '#3B82F6' };
    default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400', stroke: '#9ca3af' };
  }
};

const Leads = () => {
  const [activeTab, setActiveTab] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Tab filtering
  const tabs = [
    { id: 'Tümü', label: 'Tümü', count: 24 },
    { id: 'Sıcak', label: '🔴 Sıcak', count: 8 },
    { id: 'Ilık', label: '🟡 Ilık', count: 11 },
    { id: 'Soğuk', label: '🔵 Soğuk', count: 5 },
    { id: 'Bugün', label: '⏰ Bugün Aranacak', count: 3 }
  ];

  const filteredLeads = MOCK_LEADS.filter(lead => {
    if (activeTab === 'Sıcak' && lead.label !== 'Sıcak') return false;
    if (activeTab === 'Ilık' && lead.label !== 'Ilık') return false;
    if (activeTab === 'Soğuk' && lead.label !== 'Soğuk') return false;
    if (activeTab === 'Bugün' && !lead.isReminder) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!lead.name.toLowerCase().includes(q) && !lead.phone.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#0A0B0D] text-[#F1F2F4] font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* PAGE HEADER */}
        <header className="h-[72px] flex-shrink-0 border-b border-[#2A2D35] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-medium text-[#F1F2F4]">Leadler</h1>
            <span className="text-[13px] text-[#7C8090]">24 lead</span>
          </div>
          
          <div className="flex-1 max-w-[280px] mx-8">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8090] text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Lead ara..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#16181D] border border-[#2A2D35] rounded-[6px] pl-10 pr-4 py-2 text-[14px] text-[#F1F2F4] placeholder-[#7C8090] focus:outline-none focus:border-[#F5A623] transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-[13px] text-[#F1F2F4] border border-[#2A2D35] rounded-[6px] px-3 py-1.5 hover:bg-[#16181D] transition-colors">
              Tümü <span className="text-[10px]">▼</span>
            </button>
            <button className="flex items-center gap-1 text-[13px] text-[#F1F2F4] border border-[#2A2D35] rounded-[6px] px-3 py-1.5 hover:bg-[#16181D] transition-colors">
              Tarihe göre <span className="text-[10px]">▼</span>
            </button>
            <button 
              onClick={() => setIsNewLeadModalOpen(true)}
              className="bg-[#F5A623] text-[#0A0B0D] text-[13px] font-medium rounded-[6px] px-4 py-1.5 hover:bg-[#d9921e] transition-colors"
            >
              + Yeni Lead
            </button>
          </div>
        </header>

        {/* FİLTRE TAB'LARI */}
        <div className="px-6 border-b border-[#2A2D35] flex items-center h-12 flex-shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center">
            {tabs.map((tab, idx) => (
              <React.Fragment key={tab.id}>
                <button 
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-12 px-1 relative flex items-center gap-1.5 text-[13px] transition-colors ${activeTab === tab.id ? 'text-[#F1F2F4]' : 'text-[#7C8090] hover:text-[#F1F2F4]'}`}
                >
                  {tab.label}
                  <span className={`text-[11px] px-1.5 rounded-full ${activeTab === tab.id ? 'bg-[#2A2D35] text-[#F1F2F4]' : 'bg-[#16181D] text-[#7C8090]'}`}>
                    {tab.count}
                  </span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F5A623]" />
                  )}
                </button>
                {idx < tabs.length - 1 && <div className="w-px h-4 bg-[#2A2D35] mx-4" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL (LEAD LIST) */}
          <div className={`flex flex-col border-r border-[#2A2D35] transition-all duration-300 ${selectedLead ? 'w-[55%]' : 'w-full'}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              
              {filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-[#2A2D35] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px] text-[#7C8090]">group</span>
                  </div>
                  <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-1">Henüz lead yok</h3>
                  <p className="text-[13px] text-[#7C8090] max-w-[240px]">
                    İlk müşteri mesajını analiz etmek için "+ Yeni Lead" butonuna tıklayın.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Option: Gruplama Başlığı */}
                  <div className="text-[11px] uppercase text-[#7C8090] pb-2 mb-2 border-b border-[#1E2028]">
                    Bugün
                  </div>
                  
                  {filteredLeads.map(lead => {
                    const style = getLabelStyle(lead.label);
                    const isSelected = selectedLead?.id === lead.id;
                    
                    return (
                      <div 
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-[#1E2028]
                          ${isSelected ? 'bg-[#1A1C23] border-l-2 border-l-[#F5A623]' : 'border-l-2 border-l-transparent hover:bg-[#1E2028]'}
                          ${lead.isReminder && !isSelected ? 'bg-[#1A0A0A]' : ''}
                        `}
                      >
                        {/* Renk noktası */}
                        <div className="w-[24px] flex-shrink-0 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                        </div>
                        
                        {/* İsim + Tel */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="text-[13px] font-medium text-[#F1F2F4] truncate">{lead.name}</div>
                          <div className="text-[11px] text-[#7C8090] truncate mt-0.5">{lead.phone}</div>
                        </div>
                        
                        {/* Etiket */}
                        <div className="w-[80px] flex-shrink-0 pr-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-medium ${style.bg} ${style.text}`}>
                            {lead.label}
                          </span>
                        </div>
                        
                        {/* Skor */}
                        <div className="w-[60px] flex-shrink-0 pr-4 text-[13px] font-mono">
                          <span className={style.text}>{lead.score}/10</span>
                        </div>
                        
                        {/* Bölge/Tip */}
                        <div className="w-[120px] flex-shrink-0 pr-4">
                          <div className="text-[12px] text-[#7C8090] truncate">
                            {lead.region} {lead.type}
                          </div>
                        </div>
                        
                        {/* Tarih */}
                        <div className="w-[80px] flex-shrink-0 pr-4 flex items-center gap-1.5">
                          {lead.isReminder && <span className="material-symbols-outlined text-[14px] text-[#EF4444]">alarm</span>}
                          <span className={`text-[11px] ${lead.isReminder ? 'text-[#EF4444]' : 'text-[#7C8090]'}`}>
                            {lead.time}
                          </span>
                        </div>
                        
                        {/* Ok ikonu */}
                        <div className="w-[32px] flex-shrink-0 flex justify-end">
                          <span className={`material-symbols-outlined text-[18px] transition-colors ${isSelected ? 'text-[#F1F2F4]' : 'text-[#2A2D35]'}`}>
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* RIGHT PANEL (LEAD DETAIL) */}
          {selectedLead && (
            <div className="w-[45%] flex flex-col bg-[#0A0B0D]">
              {/* Detail Header */}
              <div className="h-[60px] px-6 border-b border-[#2A2D35] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-[16px] font-medium text-[#F1F2F4]">{selectedLead.name}</h2>
                  <span className="text-[14px] text-[#7C8090]">{selectedLead.phone}</span>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1E2028] text-[#7C8090] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                {/* Skor Bölümü */}
                <div className="bg-[#16181D] border border-[#2A2D35] rounded-[12px] p-5 mb-6 flex items-start gap-5">
                  <div className="relative w-[72px] h-[72px] flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#2A2D35]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3"
                      />
                      <path
                        className={getLabelStyle(selectedLead.label).text.replace('text-', 'stroke-')}
                        strokeDasharray={`${selectedLead.score * 10}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className={`text-[18px] font-mono font-medium ${getLabelStyle(selectedLead.label).text}`}>
                        {selectedLead.score}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[16px] text-[#7C8090] font-mono">/10</span>
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-medium ${getLabelStyle(selectedLead.label).bg} ${getLabelStyle(selectedLead.label).text}`}>
                        {selectedLead.label}
                      </span>
                      {selectedLead.isReminder && (
                        <span className="px-2 py-0.5 rounded-[4px] text-[11px] uppercase font-medium bg-[#EF4444]/10 text-[#EF4444] ml-auto flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">call</span> Bugün Ara
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#7C8090] leading-relaxed">
                      "{selectedLead.aiReason}"
                    </p>
                  </div>
                </div>

                {/* WhatsApp Bölümü */}
                <div className="bg-[#0A0B0D] border-l-2 border-l-[#25D366] border-y border-r border-[#2A2D35] rounded-[8px] p-4 mb-6">
                  <p className="text-[13px] text-[#F1F2F4] leading-relaxed mb-4">
                    {selectedLead.message}
                  </p>
                  <div className="flex items-center justify-between border-t border-[#2A2D35] pt-3">
                    <a href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#25D366] hover:underline font-medium">
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      WhatsApp'ta Aç
                    </a>
                    <button className="flex items-center gap-1.5 text-[12px] text-[#7C8090] hover:text-[#F1F2F4] transition-colors">
                      <span className="material-symbols-outlined text-[14px]">content_copy</span> Kopyala
                    </button>
                  </div>
                </div>

                {/* Mülk Tercihleri */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] uppercase text-[#7C8090] tracking-wider font-medium">Mülk Tercihleri</h3>
                    <button className="text-[#7C8090] hover:text-[#F5A623] transition-colors">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {selectedLead.preferences.map((pref, idx) => (
                      <div key={idx} className="bg-[#0A0B0D] border border-[#2A2D35] rounded-[4px] px-3 py-1.5 flex items-center gap-2">
                        <span className="text-[11px] text-[#7C8090]">{pref.label}:</span>
                        <span className="text-[11px] text-[#F1F2F4] font-medium truncate">{pref.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Durum ve Takip */}
                <div className="flex gap-4 mb-6">
                  <button className="flex-1 bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-4 py-2.5 flex items-center justify-between text-[13px] text-[#F1F2F4] hover:border-[#F5A623] transition-colors">
                    <span>Durum: Takipte</span>
                    <span className="text-[10px] text-[#7C8090]">▼</span>
                  </button>
                  <button className="flex-1 bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-4 py-2.5 flex items-center justify-between text-[13px] text-[#F1F2F4] hover:border-[#F5A623] transition-colors">
                    <span>Takip: Tarih seç</span>
                    <span className="material-symbols-outlined text-[16px] text-[#7C8090]">calendar_month</span>
                  </button>
                </div>

                {/* Notlar Bölümü */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] uppercase text-[#7C8090] tracking-wider font-medium">Notlar</h3>
                    <div className="flex items-center gap-2">
                      <button className="text-[11px] text-[#F1F2F4] border border-[#2A2D35] rounded-[4px] px-2 py-1 flex items-center gap-1 hover:bg-[#1E2028] transition-colors">
                        <span className="text-[12px]">🎙️</span> Sesli
                      </button>
                      <button className="text-[11px] text-[#F1F2F4] border border-[#2A2D35] rounded-[4px] px-2 py-1 flex items-center gap-1 hover:bg-[#1E2028] transition-colors">
                        <span className="text-[12px]">+</span> Yazılı
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {selectedLead.notes.map(note => (
                      <div key={note.id} className="bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{note.type === 'voice' ? '🎙️' : '📝'}</span>
                          <span className="text-[11px] text-[#7C8090]">{note.time}</span>
                        </div>
                        <p className="text-[12px] text-[#F1F2F4] leading-relaxed mb-2">
                          "{note.content}"
                        </p>
                        {note.aiSummary && (
                          <div className="text-[12px] text-[#F5A623]">
                            AI Özeti: {note.aiSummary}
                          </div>
                        )}
                        {note.type === 'voice' && (
                          <button className="text-[11px] text-[#7C8090] hover:text-[#F1F2F4] mt-2 flex items-center gap-1">
                            Transkripti gör <span className="text-[14px]">›</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Yeni Not Girişi */}
                  <div className="relative">
                    <textarea 
                      placeholder="Yeni not ekle..." 
                      className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] p-3 text-[13px] text-[#F1F2F4] placeholder-[#7C8090] focus:outline-none focus:border-[#F5A623] resize-none h-20"
                    />
                    <button className="absolute bottom-3 right-3 text-[12px] font-medium bg-[#F5A623] text-[#0A0B0D] px-3 py-1 rounded-[4px] hover:bg-[#d9921e] transition-colors">
                      Kaydet
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-[11px] uppercase text-[#7C8090] tracking-wider font-medium mb-4">Geçmiş</h3>
                  <div className="relative pl-3 space-y-4">
                    {/* Dikey çizgi */}
                    <div className="absolute top-2 bottom-2 left-3 w-px bg-[#2A2D35]" />
                    
                    {selectedLead.history.map(item => (
                      <div key={item.id} className="relative flex items-start gap-4">
                        <div className={`w-[24px] flex-shrink-0 flex items-center justify-center bg-[#0A0B0D] z-10 py-1 ${item.iconColor}`}>
                          <span className="text-[12px] leading-none">{item.icon}</span>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="text-[12px] text-[#F1F2F4]">{item.text}</div>
                        </div>
                        <div className="text-[11px] text-[#7C8090] pt-0.5">{item.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* YENİ LEAD MODALI */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#16181D] border border-[#2A2D35] rounded-[12px] w-full max-w-[480px] shadow-2xl flex flex-col animate-slide-up">
            <div className="h-14 border-b border-[#2A2D35] px-6 flex items-center justify-between flex-shrink-0">
              <h2 className="text-[16px] font-medium text-[#F1F2F4]">Yeni Lead Ekle</h2>
              <button 
                onClick={() => setIsNewLeadModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1E2028] text-[#7C8090] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] text-[#7C8090] mb-1.5">Müşteri Adı <span className="text-[#EF4444]">*</span></label>
                <input type="text" className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-4 py-2.5 text-[14px] text-[#F1F2F4] focus:outline-none focus:border-[#F5A623]" />
              </div>
              <div>
                <label className="block text-[13px] text-[#7C8090] mb-1.5">Telefon <span className="text-[#EF4444]">*</span></label>
                <input type="tel" className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-4 py-2.5 text-[14px] text-[#F1F2F4] focus:outline-none focus:border-[#F5A623]" />
              </div>
              <div>
                <label className="block text-[13px] text-[#7C8090] mb-1.5">Mesaj (Müşteri Talebi)</label>
                <textarea 
                  rows={5}
                  placeholder="Örn: Kadıköy'de 3+1 arıyorum, bütçem 5M TL..."
                  className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-4 py-2.5 text-[14px] text-[#F1F2F4] placeholder-[#7C8090] focus:outline-none focus:border-[#F5A623] resize-none"
                />
              </div>
            </div>

            <div className="p-6 pt-2 flex items-center justify-between">
              <button 
                onClick={() => setIsNewLeadModalOpen(false)}
                className="text-[13px] text-[#7C8090] hover:text-[#F1F2F4] hover:underline"
              >
                İptal
              </button>
              <button className="bg-[#F5A623] text-[#0A0B0D] text-[14px] font-medium rounded-[6px] px-8 py-2.5 hover:bg-[#d9921e] transition-colors">
                Analiz Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
