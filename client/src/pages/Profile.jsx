import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { User, Mail, Building, Key, Shield, LogOut, Trash2, AlertTriangle, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getRoleLabel = (role) => {
    switch(role) {
      case 'company_admin': return 'Şirket Yöneticisi';
      case 'office_manager': return 'Ofis Yöneticisi';
      case 'agent': return 'Gayrimenkul Danışmanı';
      default: return role;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
    } catch (error) {
      console.error('Hesap silinemedi:', error);
      alert('Hesap silinirken bir hata oluştu.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0F1117] text-[#F1F2F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto w-full">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[20px] font-medium text-[#F1F2F4]">Profilim</h1>
            <button onClick={logout} className="flex items-center space-x-2 text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 px-4 py-2 rounded-[6px] text-[13px] font-medium transition-colors border border-[#EF4444]/20">
              <LogOut size={14} />
              <span>Çıkış Yap</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column - Avatar Card */}
            <div className="md:col-span-1">
              <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#1E2025] text-[#F5A623] rounded-[8px] flex items-center justify-center text-[32px] font-medium mb-4">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h2 className="text-[16px] font-medium text-[#F1F2F4]">{user?.name || 'Kullanıcı'}</h2>
                <p className="text-[13px] text-[#7C8090] mt-1 mb-4">{user?.email}</p>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#2A1A00] border border-[#F5A623]/20 text-[#F5A623] rounded-full text-[11px] font-medium tracking-wide">
                  <Shield size={12} />
                  <span>{getRoleLabel(user?.role)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Account Info */}
              <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6">
                <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-4 border-b border-[#2A2D35] pb-3">Hesap Bilgileri</h3>
                <form className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Ad Soyad</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]"><User size={14}/></div>
                        <input type="text" className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#7C8090] rounded-[6px] pl-9 p-2.5 text-[13px] outline-none cursor-not-allowed" value={user?.name || ''} readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">E-posta</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]"><Mail size={14}/></div>
                        <input type="email" className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#7C8090] rounded-[6px] pl-9 p-2.5 text-[13px] outline-none cursor-not-allowed" value={user?.email || ''} readOnly />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Şirket ID</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]"><Building size={14}/></div>
                        <input type="text" className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#7C8090] rounded-[6px] pl-9 p-2.5 text-[13px] outline-none cursor-not-allowed" value={user?.company_id || ''} readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Ofis ID</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]"><Building size={14}/></div>
                        <input type="text" className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#7C8090] rounded-[6px] pl-9 p-2.5 text-[13px] outline-none cursor-not-allowed" value={user?.office_id || 'Merkez'} readOnly />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Password Change */}
              <div className="bg-[#16181D] rounded-[8px] border border-[#2A2D35] p-6">
                <h3 className="text-[14px] font-medium text-[#F1F2F4] mb-4 border-b border-[#2A2D35] pb-3">Şifre Değiştir</h3>
                <form className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Mevcut Şifre</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]"><Key size={14}/></div>
                      <input type="password" placeholder="••••••••" className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] pl-9 p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors placeholder-[#4A4E5A]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Yeni Şifre</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8090]"><Key size={14}/></div>
                      <input type="password" placeholder="••••••••" className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] pl-9 p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors placeholder-[#4A4E5A]" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="button" className="bg-[#1E2025] hover:bg-[#2A2D35] text-[#F1F2F4] font-medium py-2 px-6 rounded-[6px] text-[13px] transition-colors border border-[#2A2D35]">
                      Güncelle
                    </button>
                  </div>
                </form>
              </div>

              {/* Data Deletion Section */}
              <div className="bg-[#16181D] rounded-[8px] border border-[#EF4444]/20 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#EF4444]"></div>
                <h3 className="text-[14px] font-medium text-[#EF4444] mb-2 flex items-center space-x-2">
                  <Trash2 size={16} />
                  <span>Veri İmha Politikası (KVKK)</span>
                </h3>
                <p className="text-[#7C8090] text-[13px] mb-6 leading-relaxed">
                  Hesabınızı ve bu hesaba bağlı tüm müşteri verilerini, sesli notları, analizleri kalıcı olarak silebilirsiniz. 
                  Bu işlem KVKK kapsamında verilerinizin sistemlerimizden "Hard Delete" (tamamen yok etme) yöntemiyle silinmesini sağlar ve geri alınamaz.
                </p>
                <div className="flex justify-start">
                  <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-transparent hover:bg-[#EF4444]/10 text-[#EF4444] font-medium py-2 px-6 rounded-[6px] text-[13px] transition-colors border border-[#EF4444]/50 hover:border-[#EF4444]"
                  >
                    Tüm Verilerimi ve Hesabımı Sil
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1117]/80 backdrop-blur-sm p-4">
          <div className="bg-[#16181D] border border-[#2A2D35] rounded-[12px] w-full max-w-[400px] shadow-2xl relative overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center text-[#EF4444] mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-[18px] font-medium text-center text-[#F1F2F4] mb-2">Emin misiniz?</h3>
              <p className="text-[13px] text-[#7C8090] text-center mb-8 leading-relaxed">
                Tüm verileriniz kalıcı olarak silinecek ve bu işlemin geri dönüşü olmayacaktır. Onaylıyor musunuz?
              </p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-transparent border border-[#2A2D35] text-[#F1F2F4] hover:bg-[#1E2028] font-medium py-2.5 rounded-[6px] text-[13px] transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-medium py-2.5 rounded-[6px] text-[13px] transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Siliniyor...' : 'Evet, Kalıcı Olarak Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
