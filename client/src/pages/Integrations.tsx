import React, { useContext, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { UIContext } from '../contexts/UIContext';

const INTEGRATIONS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Müşteri mesajlarına AI ile otomatik cevap verin ve gelen talepleri saniyeler içinde analiz edin.',
    icon: 'chat',
    iconBg: 'bg-[#25D366]/10',
    iconColor: 'text-[#25D366]',
    status: 'connected', // connected, available, coming_soon
    actionText: 'Yapılandır'
  },
  {
    id: 'sahibinden',
    name: 'Sahibinden.com',
    description: 'İlanlarınızı Emlak Asistanı ile senkronize edin. Gelen mesajları anında Lead\'e dönüştürün.',
    icon: 'real_estate_agent',
    iconBg: 'bg-[#F5A623]/10',
    iconColor: 'text-[#F5A623]',
    status: 'available',
    actionText: 'Bağlan'
  },
  {
    id: 'hepsiemlak',
    name: 'Hepsiemlak',
    description: 'Tüm portföyünüzü ve müşteri mesajlarınızı tek tıkla senkronize edin, fırsatları kaçırmayın.',
    icon: 'home_work',
    iconBg: 'bg-[#E02020]/10',
    iconColor: 'text-[#E02020]',
    status: 'available',
    actionText: 'Bağlan'
  },
  {
    id: 'meta_ads',
    name: 'Meta (Facebook & Instagram) Reklamları',
    description: 'Sosyal medya formlarından gelen potansiyel müşterileri anında Sistem\'e aktarın ve ilk mesajı otomatik atın.',
    icon: 'campaign',
    iconBg: 'bg-[#1877F2]/10',
    iconColor: 'text-[#1877F2]',
    status: 'available',
    actionText: 'Bağlan'
  },
  {
    id: 'google_calendar',
    name: 'Google Takvim',
    description: 'Randevularınızı, AI hatırlatıcılarınızı ve müşteri aramalarınızı doğrudan telefon takviminize ekleyin.',
    icon: 'calendar_month',
    iconBg: 'bg-[#4285F4]/10',
    iconColor: 'text-[#4285F4]',
    status: 'available',
    actionText: 'Bağlan'
  },
  {
    id: 'tkgm',
    name: 'TKGM (Tapu Kadastro)',
    description: 'Ada/parsel sorgulamalarını hızlıca yapın, resmi bilgileri mülk analiz raporlarınıza anında dahil edin.',
    icon: 'map',
    iconBg: 'bg-[#10B981]/10',
    iconColor: 'text-[#10B981]',
    status: 'coming_soon',
    actionText: 'Yakında'
  }
];

const Integrations = () => {
  const { toggleSidebar } = useContext(UIContext);
  const [toastMessage, setToastMessage] = useState(null);

  const handleActionClick = (integration) => {
    if (integration.status === 'connected') {
      setToastMessage(`${integration.name} ayarları sayfasına yönlendiriliyorsunuz... (Demo)`);
    } else if (integration.status === 'coming_soon') {
      setToastMessage(`${integration.name} entegrasyonu şu anda geliştirme aşamasındadır.`);
    } else {
      setToastMessage(`${integration.name} bağlantısı çok yakında aktif edilecektir!`);
    }
    
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex h-screen bg-[#0A0B0D] text-[#F1F2F4] font-sans overflow-hidden">
      <Sidebar />
      
      <main className="lg:ml-[240px] flex-1 flex flex-col h-screen w-full overflow-hidden relative">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
            <div className="bg-[#16181D] border border-[#2A2D35] shadow-2xl rounded-full px-6 py-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#F5A623]">info</span>
              <span className="text-[14px] font-medium">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* PAGE HEADER */}
        <header className="h-[72px] flex-shrink-0 border-b border-[#2A2D35] px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar} 
              className="lg:hidden p-1 mr-1 text-[#F1F2F4] hover:bg-[#1E2028] rounded-md transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div>
              <h1 className="text-[20px] font-semibold text-[#F1F2F4]">Entegrasyon Merkezi</h1>
              <p className="text-[12px] text-[#7C8090] hidden sm:block mt-0.5">Tüm platformlarınızı Emlak Asistanı'na bağlayarak iş akışınızı otomatikleştirin.</p>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
          
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-8">
              <h2 className="text-[16px] font-medium text-[#F1F2F4] mb-2">Bağlı Uygulamalar</h2>
              <p className="text-[13px] text-[#7C8090]">Sisteminizle aktif olarak haberleşen entegrasyonlar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {INTEGRATIONS.filter(i => i.status === 'connected').map(integration => (
                <IntegrationCard key={integration.id} integration={integration} onActionClick={() => handleActionClick(integration)} />
              ))}
            </div>

            <div className="mb-8 border-t border-[#2A2D35] pt-8">
              <h2 className="text-[16px] font-medium text-[#F1F2F4] mb-2">Kullanılabilir Entegrasyonlar</h2>
              <p className="text-[13px] text-[#7C8090]">Emlak Asistanı deneyiminizi güçlendirmek için yeni platformlar bağlayın.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {INTEGRATIONS.filter(i => i.status !== 'connected').map(integration => (
                <IntegrationCard key={integration.id} integration={integration} onActionClick={() => handleActionClick(integration)} />
              ))}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

const IntegrationCard = ({ integration, onActionClick }) => {
  const isConnected = integration.status === 'connected';
  const isComingSoon = integration.status === 'coming_soon';

  return (
    <div className="bg-[#16181D] border border-[#2A2D35] rounded-2xl p-6 flex flex-col h-full hover:border-[#F5A623]/50 transition-colors group relative overflow-hidden">
      
      {/* Decorative Top Line */}
      {isConnected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#25D366] to-[#128C7E]"></div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${integration.iconBg}`}>
          <span className={`material-symbols-outlined text-[24px] ${integration.iconColor}`}>
            {integration.icon}
          </span>
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] px-2.5 py-1 rounded-full border border-[#25D366]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Bağlı</span>
          </div>
        ) : isComingSoon ? (
          <div className="flex items-center gap-1.5 bg-[#7C8090]/10 text-[#7C8090] px-2.5 py-1 rounded-full border border-[#7C8090]/20">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Yakında</span>
          </div>
        ) : null}
      </div>

      <div className="flex-1">
        <h3 className="text-[16px] font-semibold text-[#F1F2F4] mb-2">{integration.name}</h3>
        <p className="text-[13px] text-[#7C8090] leading-relaxed">
          {integration.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#2A2D35]">
        <button 
          onClick={onActionClick}
          className={`w-full py-2.5 rounded-[8px] text-[13px] font-medium transition-all flex items-center justify-center gap-2
            ${isConnected 
              ? 'bg-[#1E2028] text-[#F1F2F4] hover:bg-[#2A2D35]' 
              : isComingSoon 
                ? 'bg-transparent text-[#7C8090] cursor-not-allowed border border-[#2A2D35] opacity-50' 
                : 'bg-[#F5A623]/10 text-[#F5A623] hover:bg-[#F5A623]/20 border border-[#F5A623]/20'
            }`}
        >
          {integration.actionText}
          {isConnected && <span className="material-symbols-outlined text-[16px]">settings</span>}
          {!isConnected && !isComingSoon && <span className="material-symbols-outlined text-[16px]">add_link</span>}
        </button>
      </div>
    </div>
  );
};

export default Integrations;
