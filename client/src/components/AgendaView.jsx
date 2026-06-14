import React, { useContext } from 'react';
import { Calendar, Clock, Download, MapPin } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const AgendaView = ({ leads }) => {
  const { user } = useContext(AuthContext);

  // Extract events from leads
  const events = [];
  
  if (leads && leads.length > 0) {
    leads.forEach(lead => {
      let props = lead.properties;
      if (typeof props === 'string') {
        try { props = JSON.parse(props); } catch(e) {}
      }
      
      const ev = props?.calendar_event;
      if (ev && ev.is_task && ev.start_date) {
        events.push({
          id: lead.id,
          leadName: lead.name,
          title: ev.title || 'Müşteri Görüşmesi',
          description: ev.description || '',
          date: ev.start_date,
          time: ev.start_time || '09:00',
        });
      }
    });
  }


  // Demo hesabı ise ve hiç etkinlik yoksa sahte etkinlikler göster
  if (events.length === 0 && user?.email?.toLowerCase().includes('demo')) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    events.push({
      id: 'demo_1',
      leadName: 'Ahmet Yılmaz',
      title: 'Kadıköy Daire Gösterimi',
      description: 'Müşteriyle evde buluşulacak.',
      date: today.toISOString().split('T')[0],
      time: '14:30'
    });

    events.push({
      id: 'demo_2',
      leadName: 'Cemre Polat',
      title: 'Kapora Sözleşmesi',
      description: 'Ofiste imza atılacak.',
      date: tomorrow.toISOString().split('T')[0],
      time: '11:00'
    });
  }

  // Sort events by date and time
  events.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  const handleSyncCalendar = () => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/calendar/sync/${user.id}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#16181D] border border-[#2A2D35] rounded-xl overflow-hidden h-full flex flex-col shadow-lg">
      <div className="p-4 border-b border-[#2A2D35] flex items-center justify-between bg-gradient-to-r from-[#16181D] to-[#1E2025]">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#F5A623]" />
          <h3 className="font-semibold text-[#F1F2F4]">Ajanda</h3>
        </div>
        <button 
          onClick={handleSyncCalendar}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F5A623] bg-[#F5A623]/10 hover:bg-[#F5A623]/20 rounded-md transition-colors"
          title="Google / Apple Takvim'e Aktar"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Eşitle</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {events.length === 0 ? (
          <div className="text-center text-[#7C8090] mt-10">
            <Calendar className="w-10 h-10 mx-auto opacity-20 mb-3" />
            <p className="text-sm">Yaklaşan etkinlik veya randevu bulunmuyor.</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={index} className="bg-[#1E2025] rounded-lg p-3 border border-[#2A2D35] hover:border-[#F5A623]/40 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-[#F1F2F4] text-sm">{event.title}</h4>
                <span className="text-xs font-semibold text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded">
                  {event.time}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7C8090] mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2A2D35]/50">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {event.leadName.charAt(0)}
                </div>
                <span className="text-xs font-medium text-[#F1F2F4] truncate">{event.leadName}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgendaView;
