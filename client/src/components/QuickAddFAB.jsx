import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import { useAnalytics, EVENTS } from '../hooks/useAnalytics';

const QuickAddFAB = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const { track } = useAnalytics();

  const sheetRef = useRef(null);

  // Sadece dashboard ve leads sayfalarında göster
  const showFab = ['/dashboard', '/leads'].includes(location.pathname) && !!user;

  // Sesli asistan
  const [speechSupported, setSpeechSupported] = useState(false);
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setNotes(prev => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const closeSheet = () => {
    setIsOpen(false);
    // Reset form after animation
    setTimeout(() => {
      setName('');
      setPhone('');
      setNotes('');
    }, 300);
  };

  // Close sheet on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        closeSheet();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (redirect = false) => {
    if (!name.trim() || !phone.trim()) {
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 12) {
      showToast('Lütfen geçerli bir telefon numarası girin (örn: 0555 123 4567).');
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads/analyze`,
        { name, phone, message: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newLead = res.data;
      
      // Optimistic update
      queryClient.setQueryData(['leads'], (old) => {
        if (!old) return [newLead];
        return [newLead, ...old];
      });

      track(EVENTS.CUSTOMER_QUICK_ADD, { lead_id: newLead.id });

      showToast('Kaydedildi! ✓ Skor hesaplanıyor...');
      closeSheet();

      if (redirect) {
        // Detaylı forma yönlendir (örneğin lead detail id ile)
        navigate(`/leads?id=${newLead.id}`);
      }

    } catch (e) {
      console.error(e);
      showToast('Hata oluştu!');
    } finally {
      setIsSaving(false);
    }
  };

  if (!showFab && !isOpen) return null;

  return (
    <>
      {/* FAB - Sadece mobil */}
      {showFab && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed lg:hidden right-4 bottom-[72px] w-14 h-14 bg-[#10B981] hover:bg-[#059669] text-white rounded-full shadow-lg shadow-[#10B981]/20 flex items-center justify-center z-40 transition-transform active:scale-95"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#10B981] text-white px-4 py-2 rounded-full text-sm shadow-xl font-medium whitespace-nowrap animate-in slide-in-from-bottom-4 fade-in duration-300">
          {toast}
        </div>
      )}

      {/* Bottom Sheet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div 
            ref={sheetRef}
            className="w-full sm:max-w-md bg-[#1C1E24] border border-[#2A2D35] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          >
            {/* Handle/Drag Indicator (Mobile) */}
            <div className="w-full h-6 flex justify-center items-center sm:hidden" onClick={closeSheet}>
              <div className="w-12 h-1.5 bg-[#3F4350] rounded-full"></div>
            </div>

            <div className="px-5 pb-4 pt-1 sm:pt-5 border-b border-[#2A2D35] shrink-0">
              <h3 className="text-[20px] font-bold text-[#F1F2F4]">Hızlı Müşteri Ekle</h3>
              <p className="text-[13px] text-[#8E929C] mt-0.5">Sahadan dönerken 30 saniyede ekle</p>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#8E929C] mb-1.5">Ad Soyad *</label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#2A2D35]/50 border border-[#3F4350] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-xl px-4 py-3 text-[16px] text-[#F1F2F4] outline-none transition-all placeholder:text-[#5B5F6C]"
                  placeholder="Müşterinin adı"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#8E929C] mb-1.5">Telefon *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#2A2D35]/50 border border-[#3F4350] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-xl px-4 py-3 text-[16px] text-[#F1F2F4] outline-none transition-all placeholder:text-[#5B5F6C]"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#8E929C] mb-1.5 flex justify-between items-center">
                  <span>Kısa Not</span>
                  {speechSupported && (
                    <button 
                      type="button" 
                      onClick={startListening}
                      className={`text-[12px] flex items-center gap-1 transition-colors ${isListening ? 'text-[#EF4444] animate-pulse' : 'text-[#3B82F6] hover:text-[#60A5FA]'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">mic</span>
                      {isListening ? 'Dinliyor...' : 'Sesle Yazdır'}
                    </button>
                  )}
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#2A2D35]/50 border border-[#3F4350] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] rounded-xl px-4 py-3 text-[16px] text-[#F1F2F4] outline-none transition-all placeholder:text-[#5B5F6C] resize-none"
                  placeholder="Bütçe, lokasyon, aciliyet..."
                  rows={2}
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#2A2D35] shrink-0 space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving || !name.trim() || !phone.trim()}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3.5 font-bold text-[15px] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20"
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving || !name.trim() || !phone.trim()}
                className="w-full bg-transparent border border-[#3F4350] hover:bg-[#2A2D35] text-[#F1F2F4] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-medium text-[14px] transition-colors"
              >
                Kaydet ve Detay Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickAddFAB;
