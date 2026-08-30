import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

export default function VoiceFirstCard({ onStart, compact = false }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="group w-full rounded-2xl border border-[#F5A623]/40 bg-gradient-to-br from-[#F5A623]/15 via-[#1C1E24] to-[#16181D] p-4 text-left shadow-[0_10px_30px_rgba(245,166,35,0.08)] transition hover:border-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 active:scale-[0.99] sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5A623] text-black shadow-lg shadow-[#F5A623]/20">
          <Mic size={23} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F5A623]"><Sparkles size={13} />En hızlı yöntem</span>
          <span className="block text-base font-bold text-[#F1F2F4]">Sesli anlat, Kapora doldursun</span>
          {!compact ? <span className="mt-1 block text-xs leading-5 text-[#9CA0AC]">Bölge, bütçe, oda tercihi ve aciliyeti konuşmanızdan çıkarır; kaydetmeden önce size onaylatır.</span> : null}
        </span>
        <span className="material-symbols-outlined text-[#F5A623] transition group-hover:translate-x-1">arrow_forward</span>
      </div>
    </button>
  );
}
