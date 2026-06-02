import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BarChart, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Reports = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto w-full">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[20px] font-medium text-[#F1F2F4]">Raporlar & Analizler</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-8 flex flex-col items-center justify-center text-center h-80">
              <BarChart size={48} className="text-[#2A2D35] mb-4" />
              <h3 className="font-medium text-[#F1F2F4] text-[16px]">Lead Performans Grafiği</h3>
              <p className="text-[13px] text-[#7C8090] mt-2">Bu modül Recharts entegrasyonu için hazırlanmıştır. Yakında eklenecektir.</p>
            </div>
            <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-8 flex flex-col items-center justify-center text-center h-80">
              <Activity size={48} className="text-[#2A2D35] mb-4" />
              <h3 className="font-medium text-[#F1F2F4] text-[16px]">Ofis Dönüşüm Oranları</h3>
              <p className="text-[13px] text-[#7C8090] mt-2">Bu modül Recharts entegrasyonu için hazırlanmıştır. Yakında eklenecektir.</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Reports;
