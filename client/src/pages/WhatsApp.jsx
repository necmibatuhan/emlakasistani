import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Settings, CheckCircle, RefreshCw, MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const WhatsApp = () => {
  const { token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [phoneId, setPhoneId] = useState('');
  const [waToken, setWaToken] = useState('');

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['wa_status'],
    queryFn: async () => {
      const res = await axios.get(`${(import.meta.env.VITE_API_URL ?? 'http://localhost:5001')}/api/whatsapp/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['wa_messages'],
    queryFn: async () => {
      // Mock data for UI demonstration purposes
      return [
        { id: 1, from: '905551234567', text: 'Merhaba Kadıköydeki ilan için arıyorum', status: 'Sıcak', date: new Date().toISOString() },
        { id: 2, from: '905329876543', text: 'Kiralık daire bakmıştım', status: 'Soğuk', date: new Date().toISOString() }
      ];
    },
    enabled: !!status?.connected
  });

  const connectMutation = useMutation({
    mutationFn: (data) => axios.post(`${(import.meta.env.VITE_API_URL ?? 'http://localhost:5001')}/api/whatsapp/connect`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa_status'] });
    }
  });

  const handleConnect = (e) => {
    e.preventDefault();
    connectMutation.mutate({ phoneId, token: waToken });
  };

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-[20px] font-medium text-[#F1F2F4] mb-8">WhatsApp Entegrasyonu</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Setup Form */}
            <div className="lg:col-span-1">
              {statusLoading ? (
                <div className="h-64 bg-[#16181D] border border-[#2A2D35] rounded-[8px] animate-pulse" />
              ) : status?.connected ? (
                <div className="bg-[#16181D] rounded-[8px] shadow-sm border border-[#2A2D35] p-6 text-center">
                  <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#10B981]/20">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="font-medium text-[16px] text-[#F1F2F4] mb-2">Bağlantı Aktif</h3>
                  <p className="text-[13px] text-[#7C8090] mb-6">WhatsApp Business API hesabınız başarıyla bağlandı ve mesajları dinliyor.</p>
                  <button onClick={() => {/* disconnect logic */}} className="text-[#EF4444] text-[13px] font-medium hover:underline">Bağlantıyı Kes</button>
                </div>
              ) : (
                <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6">
                  <div className="flex items-center space-x-3 mb-6 border-b border-[#2A2D35] pb-4">
                    <div className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] rounded-[6px] flex items-center justify-center border border-[#25D366]/20">
                      <Settings size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#F1F2F4] text-[14px]">WhatsApp'ı Bağla</h3>
                      <p className="text-[12px] text-[#7C8090]">Business API ayarları</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleConnect} className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Phone ID</label>
                      <input 
                        type="text" required 
                        className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors"
                        value={phoneId} onChange={e=>setPhoneId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Access Token</label>
                      <input 
                        type="password" required 
                        className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors"
                        value={waToken} onChange={e=>setWaToken(e.target.value)}
                      />
                    </div>
                    <button type="submit" disabled={connectMutation.isPending} className="w-full bg-[#25D366] text-[#0A0B0D] font-medium text-[13px] py-2.5 rounded-[6px] hover:bg-[#1DA851] transition-colors disabled:opacity-50 mt-2">
                      {connectMutation.isPending ? 'Bağlanıyor...' : 'Bağlan ve Test Et'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Messages Table */}
            <div className="lg:col-span-2">
              <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-[#2A2D35] flex items-center justify-between bg-[#0A0B0D]">
                  <h3 className="font-medium text-[#F1F2F4] text-[14px]">Gelen Mesajlar</h3>
                  <div className="flex space-x-2">
                    <button onClick={() => queryClient.invalidateQueries({ queryKey: ['wa_messages']})} className="p-2 text-[#7C8090] hover:text-[#F1F2F4] hover:bg-[#1E2028] transition-colors rounded-[6px] border border-[#2A2D35] bg-[#16181D]">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {!status?.connected ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#7C8090] p-8 text-center">
                      <MessageCircle size={48} className="mb-4 opacity-50" />
                      <p className="font-medium text-[14px]">Mesajları görmek için önce WhatsApp API bağlantısını kurun.</p>
                    </div>
                  ) : messagesLoading ? (
                    <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[#2A2D35] border-t-[#25D366] rounded-full animate-spin" /></div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0A0B0D] text-[11px] uppercase tracking-wider text-[#7C8090] border-b border-[#2A2D35]">
                          <th className="p-4 font-medium">Gönderen</th>
                          <th className="p-4 font-medium">Mesaj</th>
                          <th className="p-4 font-medium">Tarih</th>
                          <th className="p-4 font-medium">Lead Durumu</th>
                          <th className="p-4 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A2D35] text-[13px]">
                        {messages.map(msg => (
                          <tr key={msg.id} className="hover:bg-[#1E2028] transition-colors group">
                            <td className="p-4 font-mono text-[#F1F2F4]">{msg.from}</td>
                            <td className="p-4 text-[#7C8090] max-w-[200px] truncate" title={msg.text}>{msg.text}</td>
                            <td className="p-4 text-[#7C8090]">{new Date(msg.date).toLocaleDateString('tr-TR')}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium border ${msg.status === 'Sıcak' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : msg.status === 'Ilık' ? 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20' : 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${msg.status === 'Sıcak' ? 'bg-[#EF4444]' : msg.status === 'Ilık' ? 'bg-[#F5A623]' : 'bg-[#3B82F6]'}`}></span>
                                <span>{msg.status}</span>
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button className="text-[#F5A623] font-medium text-[11px] uppercase tracking-wider hover:text-[#d9921e] opacity-0 group-hover:opacity-100 transition-opacity">Lead Git &rarr;</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
