import React from 'react';
import { ExternalLink, PhoneCall, TrendingUp, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExternalListingCard({ listing }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex flex-col bg-zinc-950 border border-indigo-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all hover:border-indigo-400/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]"
    >
      {/* Üst Kısım / Resim Alanı (Mock Gradient) */}
      <div className="h-32 bg-gradient-to-tr from-zinc-900 to-zinc-800 relative">
        <div className="absolute top-3 left-3 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" />
          Fırsat Yakalandı
        </div>
        <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-sm text-zinc-300 text-[10px] px-2 py-1 rounded-md border border-zinc-700/50">
          {listing.source_name || "Sahibinden"}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-zinc-100 font-medium text-sm line-clamp-2 leading-snug">
            {listing.title}
          </h3>
        </div>

        <div className="text-indigo-400 font-semibold text-lg mb-3">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: listing.currency || 'TRY', maximumFractionDigits: 0 }).format(listing.price)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span className="truncate">{listing.district}, {listing.city}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-zinc-300">{listing.rooms}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-800/60 flex items-center gap-2">
          <a 
            href={listing.url} 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 flex justify-center items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors py-2 rounded-lg text-xs font-medium border border-zinc-800"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            İlana Git
          </a>
          <a 
            href={`tel:${listing.owner_phone}`}
            className="flex justify-center items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors px-3 py-2 rounded-lg text-xs font-medium border border-emerald-500/20"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Ara
          </a>
        </div>
      </div>
    </motion.div>
  );
}
