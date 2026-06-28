import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, X, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const VoiceToText = ({ onLeadCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, recording, processing, error
  const [time, setTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const openModal = () => {
    setIsOpen(true);
    setStatus('idle');
    setTime(0);
    setErrorMsg('');
  };

  const closeModal = () => {
    if (status === 'recording') stopRecording(true);
    setIsOpen(false);
  };

  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        
        if (mediaRecorderRef.current.cancelRecordingFlag) {
          setStatus('idle');
          setTime(0);
          return;
        }

        if (chunksRef.current.length === 0) {
          setStatus('idle');
          setErrorMsg('Ses kaydedilemedi. Lütfen mikrofonunuzu kontrol edin.');
          setTime(0);
          return;
        }
        
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await processAudio(blob, mimeType);
      };

      mediaRecorderRef.current.cancelRecordingFlag = false;
      mediaRecorder.start(100);
      setStatus('recording');
      setTime(0);
      
      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (prev >= 119) { 
            mediaRecorder.stop();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Mikrofon hatası:', err);
      setErrorMsg('Mikrofona erişilemedi.');
      setStatus('idle');
    }
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.cancelRecordingFlag = cancel;
      mediaRecorderRef.current.stop();
    }
  };

  const processAudio = async (blob, mimeType) => {
    setStatus('processing');
    try {
      const extension = mimeType?.includes('mp4') ? 'm4a' : 'webm';
      const formData = new FormData();
      formData.append('audio', blob, `voicenote.${extension}`);
      
      const token = localStorage.getItem('token');
      const res = await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/voice/create-lead`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const newLead = res.data;
      if (!newLead) throw new Error('Müşteri oluşturulamadı');
      
      if (onLeadCreated) onLeadCreated(newLead);
      closeModal();
    } catch (err) {
      setStatus('error');
      setErrorMsg('Müşteri oluşturulurken hata oluştu.');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      <button 
        type="button"
        onClick={openModal}
        className="w-full bg-transparent border border-[#2A2D35] text-[#7C8090] hover:text-[#F1F2F4] hover:bg-[#1E2028] transition-colors py-2 rounded-md text-[13px] font-medium flex items-center justify-center space-x-2"
      >
        <Mic size={14} />
        <span>Sesli not</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1117]/80 backdrop-blur-sm p-4">
          <div className="bg-[#16181D] border border-[#2A2D35] rounded-[12px] w-full max-w-[480px] flex flex-col relative overflow-hidden shadow-2xl">
            <button onClick={closeModal} className="absolute top-4 right-4 text-[#7C8090] hover:text-[#F1F2F4]">
              <X size={18} />
            </button>

            <div className="p-8 flex flex-col items-center">
              {status === 'idle' && (
                <>
                  <div className="text-[11px] text-[#7C8090] uppercase tracking-widest font-medium mb-6">Sesle Yazdır</div>
                  <div className="w-16 h-16 bg-[#2A2D35] rounded-full flex items-center justify-center text-[#F1F2F4] mb-4">
                    <Mic size={24} />
                  </div>
                  <h3 className="text-[18px] font-medium text-[#F1F2F4] mb-2">Sesten Müşteri Oluştur</h3>
                  <p className="text-[13px] text-[#7C8090] text-center mb-8 px-4">
                    Müşterinin ismini, telefonunu ve talebini sesli söyleyin. Yapay zeka tüm bilgileri ayıklayıp otomatik olarak yeni bir müşteri (lead) kartı oluşturacaktır.
                  </p>
                  {errorMsg && <div className="text-[#EF4444] text-[12px] mb-4">{errorMsg}</div>}
                  <button 
                    onClick={startRecording}
                    className="w-full bg-[#F5A623] hover:bg-[#d9921e] text-[#0F1117] font-medium py-3 rounded-md text-[13px] transition-colors"
                  >
                    Kaydı Başlat
                  </button>
                </>
              )}

              {status === 'recording' && (
                <>
                  <div className="w-full flex justify-between items-center mb-12">
                    <div className="text-[11px] text-[#7C8090] uppercase tracking-widest font-medium">Sesle Yazdır</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></div>
                      <span className="text-[#EF4444] text-[11px] font-bold tracking-wider">REC</span>
                      <span className={clsx("font-mono text-[14px]", time > 100 ? "text-[#EF4444]" : "text-[#F1F2F4]")}>
                        {formatTime(time)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => stopRecording()}
                      className="flex items-center space-x-2 bg-[#F5A623] text-[#0A0B0D] px-6 py-3 rounded-[8px] font-medium hover:bg-[#d9921e] transition-colors"
                    >
                      <Mic size={18} />
                      <span>Durdur ve Çevir</span>
                    </button>
                    <button 
                      onClick={() => stopRecording(true)}
                      className="text-[#7C8090] hover:text-[#EF4444] transition-colors p-3"
                      title="İptal Et"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <p className="mt-8 text-[11px] text-[#7C8090] text-center max-w-sm px-4 leading-relaxed">
                    Bu işlem KVKK uyumlu, anonimleştirilmiş veri süreci ile yürütülmektedir. Kişisel verileriniz asla model eğitiminde kullanılmaz ve üçüncü taraflarla paylaşılmaz.
                  </p>
                </>
              )}

              {status === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-12 h-12 flex items-center justify-center mb-4">
                    <Loader2 size={32} className="text-[#F5A623] animate-spin" />
                  </div>
                  <span className="text-[13px] text-[#7C8090] font-medium">Yapay zeka analiz ediyor ve müşteri oluşturuluyor...</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-[#EF4444] mb-4"><AlertCircle size={32} /></div>
                  <p className="text-[#F1F2F4] text-[13px]">{errorMsg}</p>
                  <button onClick={() => setStatus('idle')} className="mt-6 text-[#F5A623] text-[13px] hover:underline">Tekrar Dene</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceToText;
