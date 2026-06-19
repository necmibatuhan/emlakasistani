import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { isToday } from 'date-fns';

const ReturnBanner = ({ token }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [numClients, setNumClients] = useState(0);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!token && showBanner // Fetch if banner will be shown
  });

  useEffect(() => {
    const checkReturn = () => {
      const lastActiveStr = localStorage.getItem('last_active_date');
      const now = new Date();
      
      if (lastActiveStr) {
        const lastActive = new Date(lastActiveStr);
        const diffTime = Math.abs(now - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 3) {
          setShowBanner(true);
        }
      }
      
      // Update last active
      localStorage.setItem('last_active_date', now.toISOString());
    };

    checkReturn();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      // Calculate priorities
      const priorities = leads.filter(l => l.isReminder || (l.reminder_date && isToday(new Date(l.reminder_date))) || l.score >= 80);
      setNumClients(priorities.length || 1);
    }
  }, [leads]);

  if (!showBanner || numClients === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#10B981]/20 to-transparent border border-[#10B981]/30 rounded-xl p-4 mb-6 flex items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#10B981]">waving_hand</span>
        </div>
        <div>
          <h3 className="text-[#F1F2F4] font-bold text-[15px]">Hoş geldiniz! Sizi tekrar görmek güzel.</h3>
          <p className="text-[#8E929C] text-[13px] mt-0.5">Bugün <strong className="text-[#10B981]">{numClients}</strong> öncelikli müşterinizi aramanızı öneriyoruz.</p>
        </div>
      </div>
      <button 
        onClick={() => setShowBanner(false)}
        className="text-[#8E929C] hover:text-[#F1F2F4] transition-colors shrink-0 p-1"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  );
};

export default ReturnBanner;
