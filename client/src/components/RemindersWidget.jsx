import React from 'react';
import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RemindersWidget({ leads = [], onLeadClick }) {
  // Takvim etkinliği olan ve is_task = true olanları filtrele
  const tasks = leads.filter(lead => {
    try {
      const p = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
      return p?.calendar_event?.is_task;
    } catch(e) { return false; }
  });

  if (tasks.length === 0) return null;

  // Tarihe göre sırala (En yakın tarih en üstte)
  tasks.sort((a, b) => {
    const pA = typeof a.properties === 'string' ? JSON.parse(a.properties) : a.properties;
    const pB = typeof b.properties === 'string' ? JSON.parse(b.properties) : b.properties;
    const dateA = new Date(`${pA.calendar_event.start_date}T${pA.calendar_event.start_time || '00:00:00'}`);
    const dateB = new Date(`${pB.calendar_event.start_date}T${pB.calendar_event.start_time || '00:00:00'}`);
    return dateA - dateB;
  });

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-6 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-zinc-100 font-semibold text-lg tracking-tight">Akıllı Ajanda & Görevler</h2>
          <p className="text-zinc-500 text-xs">Yapay zekanın ses kayıtlarından çıkardığı yaklaşan aksiyonlar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((lead, idx) => {
          const props = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties;
          const ev = props.calendar_event;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={lead.id} 
              className="group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-indigo-500/30 transition-colors cursor-pointer"
              onClick={() => onLeadClick && onLeadClick(lead.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-indigo-400 font-medium text-sm flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {ev.start_date} {ev.start_time ? `| ${ev.start_time.substring(0,5)}` : ''}
                </span>
                <button className="text-zinc-600 hover:text-emerald-400 transition-colors">
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-zinc-200 font-medium text-[15px] mb-1">{ev.title}</h3>
              <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{ev.description}</p>
              
              <div className="mt-auto pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Müşteri: <span className="text-zinc-300 font-medium">{lead.name}</span></span>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
