import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Check dismissed
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) return; // Hide for 7 days
    }

    // Android / Chrome setup
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Visit count & timer
    let visitCount = parseInt(localStorage.getItem('pwa_visit_count') || '0');
    visitCount += 1;
    localStorage.setItem('pwa_visit_count', visitCount.toString());

    if (visitCount >= 2) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3 * 60 * 1000); // 3 minutes
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#1C1E24] border-t border-[#10B981] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-500">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-[#F1F2F4] font-bold text-[16px] mb-1">Ana Ekrana Ekle</h3>
          {isIOS ? (
            <p className="text-[#8E929C] text-[13px] leading-relaxed">
              Uygulamayı telefonunuza yüklemek için Safari'de alt menüdeki <span className="material-symbols-outlined text-[14px] inline-block align-middle mx-0.5 text-[#F1F2F4]">ios_share</span> <strong>Paylaş</strong> ikonuna dokunun ve "Ana Ekrana Ekle"yi seçin.
            </p>
          ) : (
            <p className="text-[#8E929C] text-[13px] leading-relaxed">
              Kapora'yı ana ekranınıza ekleyerek daha hızlı ve çevrimdışı erişim sağlayın.
            </p>
          )}
        </div>
        <button 
          onClick={handleDismiss}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-[#2A2D35] text-[#8E929C] hover:text-[#F1F2F4] hover:bg-[#3F4350]"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {!isIOS && deferredPrompt && (
        <button 
          onClick={handleInstall}
          className="mt-4 w-full bg-[#10B981] hover:bg-[#059669] text-white py-2.5 rounded-xl font-bold text-[14px] transition-colors shadow-lg shadow-[#10B981]/20"
        >
          Hemen Ekle
        </button>
      )}
    </div>
  );
};

export default InstallPrompt;
