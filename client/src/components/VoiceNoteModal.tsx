import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Lock, Mic, Square, X } from 'lucide-react';

const MAX_RECORDING_SECONDS = 120;
const MIN_AUDIO_BYTES = 1_000;

const getRecorderOptions = () => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type));
  return mimeType ? { mimeType } : undefined;
};

const microphoneErrorMessage = (error) => {
  if (error?.name === 'NotAllowedError') return 'Mikrofon izni kapalı. Tarayıcıdaki kilit simgesinden mikrofon erişimini açıp tekrar deneyin.';
  if (error?.name === 'NotFoundError') return 'Bu cihazda kullanılabilir bir mikrofon bulunamadı.';
  if (error?.name === 'NotReadableError') return 'Mikrofon başka bir uygulama tarafından kullanılıyor. Diğer uygulamayı kapatıp tekrar deneyin.';
  return 'Mikrofon başlatılamadı. Güvenli bağlantıda olduğunuzu ve mikrofon iznini kontrol edin.';
};

const VoiceNoteModal = ({ isOpen, onClose, onRecordingComplete }) => {
  const [state, setState] = useState('initial');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const reset = () => {
    clearInterval(timerRef.current);
    stopTracks();
    setState('initial');
    setRecordingTime(0);
    setError('');
    setResult(null);
    audioChunksRef.current = [];
  };

  const close = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    reset();
    onClose();
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    stopTracks();
  }, []);

  const processRecording = async (blob, mimeType) => {
    if (blob.size < MIN_AUDIO_BYTES) {
      setState('error');
      setError('Kayıt çok kısa veya sessiz görünüyor. En az birkaç saniye konuşup tekrar deneyin.');
      return;
    }
    setState('processing');
    try {
      const response = await onRecordingComplete(blob, mimeType);
      setResult(response);
      setState('result');
    } catch (requestError) {
      setError(requestError?.response?.data?.error || requestError?.response?.data?.message || 'Ses kaydı işlenemedi. Kaydınız oluşturulmadı; tekrar deneyebilirsiniz.');
      setState('error');
    }
  };

  const startRecording = async () => {
    setError('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setState('error');
      setError('Ses kaydı bu tarayıcıda kullanılamıyor. Kapora’yı güncel Chrome, Safari veya Edge ile HTTPS üzerinden açın.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const options = getRecorderOptions();
      const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
      const mimeType = recorder.mimeType || options?.mimeType || 'audio/webm';
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      recorder.onerror = () => {
        stopTracks();
        setError('Kayıt sırasında mikrofon bağlantısı kesildi. Lütfen tekrar deneyin.');
        setState('error');
      };
      recorder.onstop = () => {
        clearInterval(timerRef.current);
        stopTracks();
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        void processRecording(blob, mimeType);
      };
      recorder.start(250);
      setState('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((seconds) => {
          if (seconds + 1 >= MAX_RECORDING_SECONDS && recorder.state === 'recording') recorder.stop();
          return Math.min(seconds + 1, MAX_RECORDING_SECONDS);
        });
      }, 1000);
    } catch (microphoneError) {
      stopTracks();
      setState('error');
      setError(microphoneErrorMessage(microphoneError));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  };

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="voice-modal-title">
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#2A2D35] bg-[#16181D] shadow-2xl">
        {state !== 'processing' && state !== 'recording' ? <button type="button" onClick={close} aria-label="Ses kaydı penceresini kapat" className="absolute right-4 top-4 z-10 rounded-lg p-2 text-[#8E929C] hover:bg-white/5 hover:text-white"><X size={18} /></button> : null}
        <div className="p-6 sm:p-8">
          {state === 'initial' ? <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#343843] bg-[#20232B] text-[#F5A623]"><Mic size={28} /></div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F5A623]">Hızlı müşteri ekle</p>
            <h2 id="voice-modal-title" className="mb-3 text-2xl font-bold text-[#F1F2F4]">Görüşmeyi anlat, Kapora işlesin</h2>
            <p className="mb-5 max-w-md text-sm leading-6 text-[#9CA0AC]">İsim, telefon, bölge, bütçe ve sonraki adımı doğal biçimde söyleyin. Örnek: “Ayşe Hanım, Kadıköy’de 3+1 arıyor, bütçesi 8 milyon; yarın 14.00’te arayacağım.”</p>
            <div className="mb-6 grid w-full grid-cols-3 gap-2 text-left text-xs text-[#AEB2BD]">{['Müşteri bilgisi', 'Talep ve bütçe', 'Takip aksiyonu'].map((label, index) => <div key={label} className="rounded-lg border border-[#2A2D35] bg-[#101217] p-3"><span className="mb-1 block text-[#F5A623]">0{index + 1}</span>{label}</div>)}</div>
            <button type="button" onClick={startRecording} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-4 py-3.5 font-bold text-[#0A0B0D] transition hover:bg-[#FFB83E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50"><Mic size={18} />Kaydı başlat</button>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-[#7C8090]"><Lock size={13} />Yalnızca CRM kaydı oluşturmak için işlenir.</p>
          </div> : null}
          {state === 'recording' ? <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
            <div className="mb-5 flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 font-mono text-sm text-red-400"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />KAYIT {formatTime(recordingTime)}</div>
            <h2 id="voice-modal-title" className="mb-2 text-2xl font-bold text-white">Sizi dinliyorum</h2><p className="mb-8 text-sm text-[#9CA0AC]">Net konuşun; kayıt en fazla 2 dakika sürer.</p>
            <button type="button" onClick={stopRecording} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3.5 font-semibold text-red-300 hover:bg-red-500/20"><Square size={17} fill="currentColor" />Kaydı bitir ve işle</button>
          </div> : null}
          {state === 'processing' ? <div className="flex min-h-[340px] flex-col items-center justify-center text-center" aria-live="polite"><Loader2 size={38} className="mb-5 animate-spin text-[#F5A623]" /><h2 id="voice-modal-title" className="mb-2 text-xl font-bold text-white">Görüşme işleniyor</h2><p className="max-w-sm text-sm leading-6 text-[#9CA0AC]">Müşteri bilgileri, talep ve takip aksiyonu çıkarılıyor. Pencereyi açık tutun.</p></div> : null}
          {state === 'error' ? <div className="flex min-h-[340px] flex-col items-center justify-center text-center" aria-live="assertive"><div className="mb-5 rounded-full bg-red-500/10 p-4 text-red-400"><AlertCircle size={30} /></div><h2 id="voice-modal-title" className="mb-3 text-xl font-bold text-white">Kayıt tamamlanamadı</h2><p className="mb-7 max-w-sm text-sm leading-6 text-red-200">{error}</p><button type="button" onClick={reset} className="w-full rounded-xl bg-[#F5A623] px-4 py-3 font-bold text-black">Tekrar dene</button></div> : null}
          {state === 'result' ? <div aria-live="polite">
            <div className="mb-6 flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={24} /><div><h2 id="voice-modal-title" className="text-xl font-bold text-white">Müşteri kartı hazır</h2><p className="mt-1 text-sm text-[#9CA0AC]">Kapora kaydı oluşturdu ve takip listenize ekledi.</p></div></div>
            <div className="space-y-3 rounded-xl border border-[#2A2D35] bg-[#101217] p-4"><div className="flex justify-between gap-4 text-sm"><span className="text-[#7C8090]">Müşteri</span><strong className="text-right text-white">{result?.name || 'İsim belirtilmedi'}</strong></div><div className="flex justify-between gap-4 text-sm"><span className="text-[#7C8090]">Telefon</span><span className="text-right text-[#D7D9DE]">{result?.phone || 'Belirtilmedi'}</span></div><div className="flex justify-between gap-4 text-sm"><span className="text-[#7C8090]">Öncelik</span><span className="text-right text-[#F5A623]">{result?.label || 'Analiz edildi'} · {result?.score ?? '-'} / 10</span></div><div className="border-t border-[#2A2D35] pt-3 text-sm"><span className="mb-1 block text-[#7C8090]">Sıradaki adım</span><span className="text-[#D7D9DE]">{result?.recommended_action || 'Müşteri kartını kontrol et'}</span></div></div>
            <button type="button" onClick={close} className="mt-6 w-full rounded-xl bg-[#F5A623] px-4 py-3 font-bold text-black">Müşteri kartlarına git</button>
          </div> : null}
        </div>
      </div>
    </div>
  );
};

export default VoiceNoteModal;
