import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';

const SocialProofToast = () => {
  const [feed, setFeed] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get(`${(import.meta.env.VITE_API_URL ?? 'http://localhost:5001')}/api/social-proof/feed`);
        if (res.data && res.data.length > 0) {
          setFeed(res.data);
          // Show first toast after a short delay
          setTimeout(() => setIsVisible(true), 3000);
        }
      } catch (err) {
        console.error('Failed to fetch social proof feed', err);
      }
    };
    fetchFeed();
  }, []);

  useEffect(() => {
    if (feed.length === 0) return;

    // Toast will stay visible for 5 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Wait 1 second while hidden, then show the next one
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % feed.length);
      setIsVisible(true);
    }, 15000); // 10s delay between toasts

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, feed.length]);

  if (feed.length === 0) return null;

  const currentItem = feed[currentIndex];

  return (
    <div 
      className={`fixed bottom-6 left-6 z-50 transition-all duration-700 ease-in-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-surface-container-high/90 backdrop-blur-md border border-outline-variant shadow-2xl rounded-2xl p-3 pr-6 flex items-center gap-4 max-w-[320px] hover:scale-105 transition-transform cursor-default relative overflow-hidden group">
        
        {/* Shine effect */}
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] pointer-events-none" />

        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-inner"
          style={{ backgroundColor: currentItem.avatar_color }}
        >
          {currentItem.display_name.charAt(0)}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface text-[14px]">
              {currentItem.display_name}
            </span>
            <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
              <MapPin size={10} />
              {currentItem.city}
            </span>
          </div>
          <span className="text-[13px] text-on-surface-variant leading-snug">
            {currentItem.action}
          </span>
          <span className="text-[10px] text-primary mt-0.5 font-medium tracking-wide">
            {currentItem.relative_time}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SocialProofToast;
