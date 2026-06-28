import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AgendaView = ({ leads }) => {
  const { user } = useContext(AuthContext);

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

  const userEmail = user?.email || '';
  const isDemoAccount = userEmail.toLowerCase().includes('demo') || userEmail.toLowerCase() === 'agent@c21.com';
  if (events.length === 0 && isDemoAccount) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    events.push({
      id: 'demo_1',
      leadName: 'Ahmet Yılmaz',
      title: 'Kadıköy Daire Gösterimi',
      date: today.toISOString().split('T')[0],
      time: '14:30',
      isCompleted: true
    });

    events.push({
      id: 'demo_2',
      leadName: 'Cemre Polat',
      title: 'Kapora Sözleşmesi',
      date: tomorrow.toISOString().split('T')[0],
      time: '11:00',
      isCompleted: false
    });
  }

  events.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  const handleSyncCalendar = () => {
    const url = `${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/calendar/sync/${user.id}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between pb-3 shrink-0">
        <h3 className="font-medium text-[14px] text-[#F1F2F4]">Ajanda</h3>
        <button 
          onClick={handleSyncCalendar}
          className="text-[11px] text-[#7C8090] border border-[#2A2D35] hover:text-[#F1F2F4] hover:bg-[#1E2028] px-2 py-1 rounded transition-colors"
        >
          + Ekle
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar h-[calc(100vh-280px)] pr-1">
        {events.length === 0 ? (
          <div className="text-center text-[#7C8090] mt-10">
            <p className="text-[12px]">Bugün planlanmış etkinlik yok.</p>
          </div>
        ) : (
          events.map((event, index) => {
             const isCompleted = event.isCompleted || false;
             const borderClass = isCompleted ? 'border-l-[#10B981]' : 'border-l-[#F5A623]';
             return (
              <div key={index} className={`bg-[#16181D] rounded-[8px] border border-[#2A2D35] border-l-[3px] ${borderClass} p-3 flex flex-col gap-2 hover:border-[#3A3D45] transition-colors`}>
                <h4 className="font-medium text-[#F1F2F4] text-[13px]">{event.title}</h4>
                <div className="flex flex-col gap-1">
                  <div className="font-mono text-[11px] text-[#7C8090]">
                    ⏰ {new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })} · {event.time}
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] text-[#7C8090]">👤 {event.leadName}</span>
                     <button className="text-[11px] text-[#7C8090] hover:text-[#F1F2F4] transition-colors">
                       Detay →
                     </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgendaView;
