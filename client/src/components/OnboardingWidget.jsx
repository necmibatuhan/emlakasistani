import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import clsx from 'clsx';

export default function OnboardingWidget({ token }) {
  const { data: progress, isLoading, refetch } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/onboarding/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    refetchInterval: 10000 // Poll every 10s to see if they leveled up
  });

  if (isLoading || !progress) return null;

  const levelNames = {
    1: 'Çırak Asistan',
    2: 'Teknoloji Odaklı Danışman',
    3: 'Eşleşme Avcısı',
    4: 'AI Satış Uzmanı'
  };

  const maxLevel = 4;
  const currentLevel = progress.current_level || 1;
  const progressPercent = ((currentLevel - 1) / (maxLevel - 1)) * 100;

  // Level 1 -> 2 requirements
  const l2_tasks = [
    { label: '3 Müşteri Ekle', done: progress.has_added_3_leads },
    { label: 'İlan Analizi Yap', done: progress.has_analyzed_listing }
  ];

  // Level 2 -> 3 requirements
  const l3_tasks = [
    { label: 'İlk Eşleşmeni Yakala', done: progress.has_first_match }
  ];

  // Level 3 -> 4 requirements
  const l4_tasks = [
    { label: '10 Müşteriye Ulaş', done: progress.has_10_leads }
  ];

  let currentTasks = [];
  let teaser = '';
  
  if (currentLevel === 1) {
    currentTasks = l2_tasks;
    teaser = 'İpucu: Pro pakette müşterileri sesli mesaj bırakarak saniyeler içinde ekleyebilirsiniz.';
  } else if (currentLevel === 2) {
    currentTasks = l3_tasks;
    teaser = 'İpucu: Pro pakette eşleşmeler otomatik WhatsApp sunumu olarak hazırlanır.';
  } else if (currentLevel === 3) {
    currentTasks = l4_tasks;
    teaser = 'İpucu: Tüm eşleşmeleri anında müşteriye göndermek için Pro\'yu deneyin.';
  } else {
    teaser = 'Tebrikler! AI Satış Uzmanısınız. Tüm limitleri kaldırmak için hemen Pro\'ya geçin.';
  }

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 shadow-sm mb-2 flex flex-col md:flex-row items-center gap-6">
      {/* Badge & Level */}
      <div className="flex flex-col items-center justify-center shrink-0">
        <div className="w-16 h-16 rounded-full bg-surface-container border-[3px] border-primary flex items-center justify-center text-2xl shadow-md">
          {currentLevel === 1 && '🌱'}
          {currentLevel === 2 && '📱'}
          {currentLevel === 3 && '🎯'}
          {currentLevel === 4 && '👑'}
        </div>
        <span className="text-[11px] font-bold text-primary uppercase mt-2 tracking-wider">Level {currentLevel}</span>
      </div>

      <div className="flex-1 w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-on-surface text-lg">{levelNames[currentLevel]}</h3>
          <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
            {currentLevel}/{maxLevel}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-surface-container-highest rounded-full h-2.5 mb-4 overflow-hidden">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {currentLevel < maxLevel && (
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <span className="text-on-surface-variant mr-1">Sonraki Seviye Görevleri:</span>
            {currentTasks.map((t, i) => (
              <div key={i} className={clsx("flex items-center gap-1.5", t.done ? "text-status-hot" : "text-on-surface")}>
                <span className="material-symbols-outlined text-[16px]">
                  {t.done ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className={clsx(t.done && "line-through opacity-70")}>{t.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 text-xs text-on-surface-variant italic bg-surface-container p-2 rounded border border-outline/50 flex items-start gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#F5A623]">lightbulb</span>
          <p>{teaser}</p>
        </div>
      </div>
    </div>
  );
}
