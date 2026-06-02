import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Home, Plus, MapPin, Tag, Check, Search, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const fetchProperties = async (token) => {
  const { data } = await axios.get('http://localhost:5001/api/properties', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const Properties = () => {
  const { token, user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', type: 'Satılık', category: 'Konut', city: '', district: '', price: '', sqm: '', rooms: ''
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => fetchProperties(token)
  });

  const createMutation = useMutation({
    mutationFn: (newProp) => axios.post('http://localhost:5001/api/properties', newProp, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setShowModal(false);
      setFormData({ title: '', type: 'Satılık', category: 'Konut', city: '', district: '', price: '', sqm: '', rooms: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      price: Number(formData.price),
      sqm: Number(formData.sqm)
    });
  };

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[20px] font-medium text-[#F1F2F4]">Portföy Yönetimi</h1>
            <button onClick={() => setShowModal(true)} className="bg-[#F5A623] hover:bg-[#d9921e] text-[#0A0B0D] px-4 py-2 rounded-[6px] text-[13px] font-medium flex items-center space-x-2 transition-colors">
              <Plus size={16} />
              <span>Yeni Mülk Ekle</span>
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-[#16181D] rounded-xl border border-[#2A2D35] animate-pulse" />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-[#16181D] rounded-[10px] border border-[#2A2D35] p-16 flex flex-col items-center justify-center text-[#7C8090]">
              <Building size={48} className="mb-4 opacity-50 text-[#7C8090]" />
              <p className="font-medium text-[14px] text-[#7C8090]">Henüz portföye mülk eklenmemiş.</p>
              <button onClick={() => setShowModal(true)} className="mt-4 text-[#F5A623] text-[13px] font-medium hover:underline">İlk mülkü ekle</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(prop => (
                <div key={prop.id} className="bg-[#16181D] rounded-[10px] border border-[#2A2D35] overflow-hidden group hover:border-[#4A4E5A] transition-colors flex flex-col">
                  <div className="h-40 bg-[#0A0B0D] border-b border-[#2A2D35] relative flex items-center justify-center">
                    <Building size={48} className="text-[#2A2D35]" />
                    <div className="absolute top-3 right-3 bg-[#0A0B0D]/80 backdrop-blur-sm border border-[#2A2D35] px-2.5 py-1 rounded-[4px] text-[10px] font-bold text-[#F1F2F4] uppercase tracking-wider">
                      {prop.status}
                    </div>
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-[4px] text-[10px] font-bold text-[#0A0B0D] uppercase tracking-wider ${prop.type === 'Satılık' ? 'bg-[#EF4444]' : 'bg-[#3B82F6]'}`}>
                      {prop.type}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-medium text-[#F1F2F4] text-[15px] line-clamp-1 mb-1">{prop.title}</h3>
                    <div className="flex items-center space-x-1.5 text-[#7C8090] text-[12px] mb-4">
                      <MapPin size={12} />
                      <span>{prop.city}, {prop.district}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2D35]">
                      <div className="font-mono font-medium text-[18px] text-[#F1F2F4]">
                        {new Intl.NumberFormat('tr-TR').format(prop.price)} ₺
                      </div>
                      <div className="flex space-x-2 text-[11px] font-mono text-[#7C8090] bg-[#0A0B0D] border border-[#2A2D35] px-2 py-1 rounded-[4px]">
                        <span>{prop.rooms}</span>
                        <span>•</span>
                        <span>{prop.sqm}m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0A0B0D]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#16181D] rounded-[10px] border border-[#2A2D35] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#2A2D35] flex justify-between items-center">
              <h2 className="text-[16px] font-medium text-[#F1F2F4]">Yeni Mülk Ekle</h2>
              <button onClick={() => setShowModal(false)} className="text-[#7C8090] hover:text-[#F1F2F4] transition-colors">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="prop-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">İlan Başlığı</label>
                  <input required className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Türü</label>
                    <select className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                      <option>Satılık</option><option>Kiralık</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Kategori</label>
                    <select className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                      <option>Konut</option><option>İşyeri</option><option>Arsa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Şehir</label>
                    <input required className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">İlçe</label>
                    <input required className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors" value={formData.district} onChange={e=>setFormData({...formData, district: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Fiyat (TL)</label>
                    <input required type="number" className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Oda Sayısı</label>
                    <input required className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors" placeholder="Örn: 3+1" value={formData.rooms} onChange={e=>setFormData({...formData, rooms: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Brüt m²</label>
                    <input required type="number" className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors" value={formData.sqm} onChange={e=>setFormData({...formData, sqm: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[#2A2D35] bg-[#0A0B0D] flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-[6px] text-[13px] font-medium text-[#7C8090] hover:text-[#F1F2F4] transition-colors">İptal</button>
              <button type="submit" form="prop-form" disabled={createMutation.isPending} className="bg-[#F5A623] hover:bg-[#d9921e] text-[#0A0B0D] px-5 py-2.5 rounded-[6px] text-[13px] font-medium transition-colors disabled:opacity-50">
                {createMutation.isPending ? 'Ekleniyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
