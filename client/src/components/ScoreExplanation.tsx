import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const ScoreExplanation = ({ lead }) => {
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  const getScoreColor = (score) => {
    if (!score) return 'bg-[#2A2D35] text-[#8E929C] border-[#3F4350]';
    if (score >= 80) return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30';
    if (score >= 60) return 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30';
    return 'bg-[#7C8090]/10 text-[#7C8090] border-[#7C8090]/30';
  };

  const handleRefresh = async (e) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/leads/${lead.id}/calculate-score`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await queryClient.invalidateQueries(['leads']);
      await queryClient.invalidateQueries(['lead', lead.id]);
    } catch (error) {
      console.error(error);
      alert('Skor güncellenemedi.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scoreUpdatedDate = lead.score_updated_at ? new Date(lead.score_updated_at) : null;
  const isRecentlyUpdated = scoreUpdatedDate && (Date.now() - scoreUpdatedDate.getTime()) < 24 * 60 * 60 * 1000;
  
  let tags = [];
  if (lead.score_tags) {
    try {
      tags = typeof lead.score_tags === 'string' ? JSON.parse(lead.score_tags) : lead.score_tags;
    } catch (e) {}
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold cursor-pointer transition-colors ${getScoreColor(lead.score)}`}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
        {lead.score || '--'}
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 mt-2 w-64 p-4 bg-[#1C1E24] border border-[#2A2D35] rounded-xl shadow-2xl left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-[#F1F2F4] text-sm">Yapay Zeka Analizi</h4>
            <span className={`text-lg font-bold ${getScoreColor(lead.score).split(' ')[1]}`}>
              {lead.score || 0}/100
            </span>
          </div>
          
          <p className="text-xs text-[#8E929C] mb-3 leading-relaxed">
            {lead.score_reason || lead.reasoning || "Skorlama için yeterli veri yok. Lütfen notlar ekleyin."}
          </p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#2A2D35] text-[#F1F2F4] text-[10px] rounded-full border border-[#3F4350]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#2A2D35]">
            <span className="text-[10px] text-[#7C8090]">
              {scoreUpdatedDate ? `Son gün: ${scoreUpdatedDate.toLocaleDateString('tr-TR')}` : 'Güncellenmedi'}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isRecentlyUpdated}
              className={`text-[11px] px-2 py-1 rounded border flex items-center gap-1 transition-colors
                ${isRefreshing || isRecentlyUpdated 
                  ? 'bg-transparent text-[#7C8090] border-[#3F4350] cursor-not-allowed' 
                  : 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30 hover:bg-[#F5A623]/20'
                }`}
            >
              <span className={`material-symbols-outlined text-[12px] ${isRefreshing ? 'animate-spin-custom' : ''}`}>
                sync
              </span>
              Yenile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreExplanation;
