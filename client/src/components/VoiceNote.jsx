import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, X, Check, Loader2 } from 'lucide-react';

const VoiceNote = ({ leadId, onSaved }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, recording, processing, error, success
  const [time, setTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [transcriptData, setTranscriptData] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  
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
    setAnalysisResult(null);
    setTranscriptData('');
    setShowTranscript(false);
    setTime(0);
    setErrorMsg('');
  };

  const closeModal = () => {
    if (status === 'recording') stopRecording(true); // cancel
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
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        
        if (mediaRecorderRef.current.cancelRecordingFlag) {
          setStatus('idle');
          setTime(0);
          return;
        }

        if (time < 3) {
          setStatus('idle');
          setErrorMsg('Kayıt çok kısa. Lütfen daha fazla konuşun.');
          setTime(0);
          return;
        }
        
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await processAudio(blob);
      };

      mediaRecorderRef.current.cancelRecordingFlag = false;
      mediaRecorder.start();
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

  const processAudio = async (blob) => {
    setStatus('processing');
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'voicenote.webm');
      
      const token = localStorage.getItem('token');
      const transcribeRes = await axios.post('http://localhost:5001/api/voice/transcribe', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const transcript = transcribeRes.data.transcript;
      if (!transcript) throw new Error('Transkript alınamadı');
      setTranscriptData(transcript);

      const analyzeRes = await axios.post('http://localhost:5001/api/voice/analyze', {
        leadId, transcript
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAnalysisResult(analyzeRes.data.analysis);
      setStatus('success');
      
      if(onSaved) onSaved();

    } catch (err) {
      setStatus('error');
      setErrorMsg('Analiz sırasında hata oluştu.');
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
        onClick={openModal}
        className="w-full bg-transparent border border-[#2A2D35] text-[#7C8090] hover:text-[#F1F2F4] hover:bg-[#1E2028] transition-colors py-2 rounded-md text-[13px] font-medium flex items-center justify-center space-x-2"
      >
        <Mic size={14} />
        <span>Sesli Not Ekle</span>
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
                  <div className="text-[11px] text-[#7C8090] uppercase tracking-widest font-medium mb-6">Sesli Not</div>
                  <div className="w-16 h-16 bg-[#2A2D35] rounded-full flex items-center justify-center text-[#F1F2F4] mb-4">
                    <Mic size={24} />
                  </div>
                  <h3 className="text-[18px] font-medium text-[#F1F2F4] mb-2">Görüşmeyi özetle</h3>
                  <p className="text-[13px] text-[#7C8090] text-center mb-8 px-4">
                    Telefonu kapattıktan sonra müşteriyle ne konuştuğunuzu anlatın. AI otomatik olarak analiz edecektir.
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
                    <div className="text-[11px] text-[#7C8090] uppercase tracking-widest font-medium">Sesli Not</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></div>
                      <span className="text-[#EF4444] text-[11px] font-bold tracking-wider">REC</span>
                      <span className={clsx("font-mono text-[14px]", time > 100 ? "text-[#EF4444]" : "text-[#F1F2F4]")}>
                        {formatTime(time)}
                      </span>
                    </div>
                  </div>

                  {/* Ses dalgası animasyonu */}
                  <div className="flex items-end space-x-1 mb-12 h-8">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-1.5 bg-[#EF4444] rounded-full wave-bar" />
                    ))}
                  </div>

                  <div className="w-full space-y-3">
                    <button 
                      onClick={() => stopRecording()}
                      className="w-full border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 font-medium py-3 rounded-md text-[13px] transition-colors"
                    >
                      Durdur
                    </button>
                    <button 
                      onClick={() => stopRecording(true)}
                      className="w-full text-[#7C8090] hover:text-[#F1F2F4] text-[13px] font-medium py-2"
                    >
                      İptal
                    </button>
                  </div>
                </>
              )}

              {status === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-12 h-12 flex items-center justify-center mb-4">
                    <Loader2 size={32} className="text-[#F5A623] animate-spin" />
                  </div>
                  <span className="text-[13px] text-[#7C8090] font-medium">Analiz ediliyor...</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-[#EF4444] mb-4"><AlertCircle size={32} /></div>
                  <p className="text-[#F1F2F4] text-[13px]">{errorMsg}</p>
                  <button onClick={() => setStatus('idle')} className="mt-6 text-[#F5A623] text-[13px] hover:underline">Tekrar Dene</button>
                </div>
              )}

              {status === 'success' && (
                <div className="w-full border border-[#10B981] rounded-lg p-5 bg-[#0F1117] text-left">
                  <div className="flex items-center space-x-2 mb-4 border-b border-[#2A2D35] pb-3">
                    <Check size={16} className="text-[#10B981]" />
                    <span className="text-[14px] font-medium text-[#F1F2F4]">Güncellendi</span>
                  </div>

                  {analysisResult && (
                    <div className="space-y-2 mb-4">
                      {analysisResult.guncelleme?.yeni_skor && (
                        <div className="flex text-[13px]">
                          <span className="text-[#7C8090] w-24">Skor</span>
                          <span className="text-[#F1F2F4] flex items-center">
                            <span className="font-mono">{analysisResult.guncelleme.yeni_skor}</span>
                            <span className="text-[#7C8090] mx-2">›</span>
                            <span className="text-[#10B981]">Güncel</span>
                          </span>
                        </div>
                      )}
                      {analysisResult.guncelleme?.yeni_durum && (
                        <div className="flex text-[13px]">
                          <span className="text-[#7C8090] w-24">Durum</span>
                          <span className="text-[#F1F2F4] flex items-center">
                            <span className="text-[#7C8090] mr-2">›</span>
                            <span>{analysisResult.guncelleme.yeni_durum}</span>
                          </span>
                        </div>
                      )}
                      {analysisResult.hatirlatici?.gerekli_mi && (
                        <div className="flex text-[13px]">
                          <span className="text-[#7C8090] w-24">Randevu</span>
                          <span className="text-[#F1F2F4] flex items-center">
                            <span className="text-[#7C8090] mr-2">›</span>
                            <span>{analysisResult.hatirlatici.tarih_ipucu}</span>
                          </span>
                        </div>
                      )}
                      {(analysisResult.mulk_tercihleri?.bolge || analysisResult.mulk_tercihleri?.oda) && (
                        <div className="flex text-[13px]">
                          <span className="text-[#7C8090] w-24">Mülk tercihi</span>
                          <span className="text-[#F1F2F4] flex items-center">
                            <span className="text-[#7C8090] mr-2">›</span>
                            <span>Güncellendi</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 border-t border-[#2A2D35] pt-4">
                    <button 
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="text-[12px] text-[#7C8090] hover:text-[#F1F2F4] flex items-center"
                    >
                      Transkripti gör ›
                    </button>
                    {showTranscript && (
                      <div className="mt-2 p-3 bg-[#0F1117] border border-[#2A2D35] rounded font-mono text-[11px] text-[#7C8090] max-h-[80px] overflow-y-auto leading-relaxed">
                        {transcriptData}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={closeModal}
                    className="w-full mt-6 bg-[#F5A623] text-[#0F1117] font-medium py-2.5 rounded-md text-[13px]"
                  >
                    Karta Dön
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceNote;
