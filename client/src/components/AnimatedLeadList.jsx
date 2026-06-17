import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, User, Phone, MapPin, Building, Banknote, FileText, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

// Stagger Ayarları (Sayfa açılışında kartların sırayla yukarıdan gelmesi)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 } // Her kart arası 0.1 saniye gecikme
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

/**
 * Premium karanlık temalı, Layout animasyonlu Lead Kartı Bileşeni
 */
function AnimatedLeadCard({ lead }) {
  // Kartın açık/genişlemiş olup olmadığını tutar
  const [isExpanded, setIsExpanded] = useState(false);
  
  const score = lead.score || 50;
  const isUrgent = score >= 90;
  
  let hasRedFlag = false;
  let redFlagReason = '';
  try {
    const props = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
    hasRedFlag = props?.risk_analysis?.has_red_flag === true;
    redFlagReason = props?.risk_analysis?.risk_reason || '';
  } catch(e) {}

  return (
    <motion.div
      layout // Framer Motion: Genişleme veya daralma anında iç unsurları pürüzsüz kaydırır
      variants={itemVariants}
      onClick={() => setIsExpanded(!isExpanded)}
      className={clsx(
        "relative overflow-hidden cursor-pointer rounded-xl border transition-colors duration-300",
        "bg-zinc-950 hover:bg-zinc-900",
        isExpanded ? "border-zinc-700 shadow-xl shadow-black" : "border-zinc-800 shadow-sm"
      )}
    >
      <motion.div layout className="p-5 flex flex-col gap-4">
        
        {/* Üst Kısım: İsim & Skor & Pulse Badge */}
        <motion.div layout className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-medium tracking-tight">{lead.name}</h3>
              <p className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3" /> {lead.phone}
              </p>
            </div>
          </div>
          
          <motion.div 
            layout
            // Acil ise (skor >= 90) hafif nabız atma efekti uygula
            animate={isUrgent ? { scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px rgba(251,191,36,0)", "0px 0px 15px rgba(251,191,36,0.2)", "0px 0px 0px rgba(251,191,36,0)"] } : {}}
            transition={isUrgent ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
              isUrgent ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-zinc-800/50 text-zinc-300 border-zinc-700"
            )}
          >
            {isUrgent ? <Flame className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>% {score}</span>
          </motion.div>
        </motion.div>
        
        {/* Risk Badge (Red Flag) */}
        {hasRedFlag && (
          <motion.div layout className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold block mb-0.5">Riskli Müşteri</span>
              <span className="text-red-400/80 line-clamp-2">{redFlagReason || 'Yapay zeka bu lead için risk tespit etti.'}</span>
            </div>
          </motion.div>
        )}

        {/* Genişleyebilir Detay Bölümü (Layout Animation ile pürüzsüz açılır) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col gap-4 overflow-hidden"
            >
              <div className="h-px w-full bg-zinc-800/60" />
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  {lead.location || 'Lokasyon Belirsiz'}
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Building className="w-4 h-4 text-zinc-500" />
                  {lead.propertyType || 'Ev Tipi Belirsiz'}
                </div>
                <div className="flex items-center gap-2 text-zinc-300 col-span-2">
                  <Banknote className="w-4 h-4 text-zinc-500" />
                  {lead.budgetStr || 'Bütçe Belirtilmedi'}
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-1.5 text-xs font-medium uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> AI Özeti & Notlar
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {lead.summary || 'Ses kaydı özeti bulunmuyor.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
}

/**
 * Ana Liste Bileşeni
 */
export default function AnimatedLeadList({ leads = [] }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-surface-container/30 border border-outline/30 rounded-2xl p-8 text-center mt-2">
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 text-on-surface-variant border border-outline">
          <User className="w-8 h-8 opacity-50" />
        </div>
        <h4 className="text-on-surface font-headline-sm mb-2">Henüz Müşteri Yok</h4>
        <p className="text-on-surface-variant font-body-sm max-w-sm">
          Sağ üst köşedeki <span className="text-primary font-bold">Yeni</span> butonuna tıklayarak sesli not bırakın ve yapay zekanın ilk müşterinizi analiz etmesine izin verin.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 w-full"
    >
      {leads.map((lead) => (
        <AnimatedLeadCard key={lead.id} lead={lead} />
      ))}
    </motion.div>
  );
}
