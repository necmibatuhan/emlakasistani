import React, { useState, useRef, useEffect } from 'react';

const VoiceNoteModal = ({ isOpen, onClose, onRecordingComplete }) => {
  const [state, setState] = useState('initial'); // 'initial', 'recording', 'processing', 'result'
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (state === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Tarayıcınız mikrofonu desteklemiyor veya güvenli bağlantı (HTTPS/localhost) gerektiriyor.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setState('processing');
        if (onRecordingComplete) onRecordingComplete(audioBlob);
      };

      mediaRecorder.start();
      setState('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Mikrofon erişimi reddedildi veya bulunamadı.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Click outside to close (only in initial or result state) */}
      <div 
        className="absolute inset-0" 
        onClick={() => {
          if (state === 'initial' || state === 'result') {
            onClose();
            setState('initial');
          }
        }}
      ></div>

      <div className="relative z-10 w-full max-w-[480px]">
        {state === 'initial' && (
          <div className="bg-panel border custom-border rounded-xl overflow-hidden flex flex-col items-center justify-center p-stack-lg min-h-[320px] animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-stack-md border custom-border">
              <span className="material-symbols-outlined text-on-surface-variant text-[32px]">mic</span>
            </div>
            <h2 className="font-headline-md text-headline-md mb-unit">Görüşmeyi özetle</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-stack-lg text-center">Yapay zeka ile görüşmenizi kaydedip otomatik olarak lead kartına aktarın.</p>
            <button 
              onClick={startRecording}
              className="w-full bg-primary-container text-[#0A0B0D] py-2 px-4 rounded font-data-tabular text-data-tabular hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">fiber_manual_record</span>
              Kaydı başlat
            </button>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#10B981] font-medium bg-[#10B981]/10 px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Uçtan Uca Şifreli & Güvenli
            </div>
          </div>
        )}

        {state === 'recording' && (
          <div className="bg-panel border custom-border rounded-xl overflow-hidden flex flex-col items-center justify-center p-stack-lg min-h-[320px] animate-fade-in-up">
            <div className="flex items-center gap-2 mb-stack-lg text-error font-data-tabular text-data-tabular">
              <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>fiber_manual_record</span>
              REC {formatTime(recordingTime)}
            </div>
            <div className="flex items-end justify-center gap-1 h-12 mb-stack-lg">
              <div className="w-2 bg-error rounded-sm wave-bar"></div>
              <div className="w-2 bg-error rounded-sm wave-bar"></div>
              <div className="w-2 bg-error rounded-sm wave-bar"></div>
              <div className="w-2 bg-error rounded-sm wave-bar"></div>
              <div className="w-2 bg-error rounded-sm wave-bar"></div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-stack-lg">Dinleniyor...</p>
            <button 
              onClick={stopRecording}
              className="w-full border custom-border bg-transparent text-on-surface py-2 px-4 rounded font-data-tabular text-data-tabular hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">stop</span>
              Durdur
            </button>
          </div>
        )}

        {state === 'processing' && (
          <div className="bg-panel border custom-border rounded-xl overflow-hidden flex flex-col items-center justify-center p-stack-lg min-h-[320px] animate-fade-in-up">
            <div className="relative w-16 h-16 mb-stack-md">
              <div className="absolute inset-0 rounded-full border-4 border-surface-container"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary-container border-t-transparent animate-spin-custom"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container">memory</span>
              </div>
            </div>
            <h2 className="font-headline-md text-headline-md mb-unit">Analiz ediliyor</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center max-w-[280px]">Ses kaydı metne dönüştürülüyor ve lead verileri çıkarılıyor. Bu işlem birkaç saniye sürebilir.</p>
          </div>
        )}

        {state === 'result' && (
          <div className="bg-panel border custom-border rounded-xl overflow-hidden flex flex-col min-h-[320px] relative animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#10B981]"></div>
            <div className="p-stack-md border-b custom-border flex items-center gap-stack-sm">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md">Güncellendi</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Lead kartı başarıyla güncellendi.</p>
              </div>
            </div>
            <div className="p-stack-md flex-1">
              <ul className="space-y-panel-gap">
                <li className="flex items-center justify-between font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Lead Skoru</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through opacity-50">?</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    <span className="text-[#10B981] font-data-tabular">8</span>
                  </div>
                </li>
                <li className="flex items-center justify-between font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Durum</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through opacity-50">Bekliyor</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    <span className="text-primary-container">Analiz Edildi</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="p-stack-md border-t custom-border bg-surface-container-lowest">
              <button 
                onClick={() => {
                  onClose();
                  setState('initial');
                }}
                className="w-full border custom-border bg-surface-container text-on-surface py-2 px-4 rounded font-data-tabular text-data-tabular hover:bg-surface-container-high transition-colors"
              >
                Karta dön
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceNoteModal;
