import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, setUser } = useContext(AuthContext);
  
  const status = searchParams.get('status');
  const [loading, setLoading] = useState(status === 'success');

  useEffect(() => {
    const fetchUpdatedUser = async () => {
      if (status === 'success' && token) {
        try {
          const res = await axios.get(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (err) {
          console.error('Kullanıcı bilgisi güncellenemedi', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUpdatedUser();
  }, [status, token, setUser]);

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#16181D] rounded-[10px] border border-[#2A2D35] p-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-[20px] font-medium text-[#F1F2F4] mb-2">Ödemeniz Onaylanıyor...</h2>
            <p className="text-[14px] text-[#7C8090]">Lütfen bekleyin, hesabınız güncelleniyor.</p>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center">
            <CheckCircle size={64} className="text-[#10B981] mb-6" />
            <h2 className="text-[20px] font-medium text-[#F1F2F4] mb-2">Ödeme Başarılı!</h2>
            <p className="text-[14px] text-[#7C8090] mb-8">
              Harika! Ödemeniz başarıyla alındı ve planınız yükseltildi. Yeni özelliklerinizi hemen kullanmaya başlayabilirsiniz.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#F5A623] text-[#0A0B0D] font-medium text-[13px] py-2.5 rounded-[6px] hover:bg-[#d9921e] transition-colors"
            >
              Panoya Dön
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <XCircle size={64} className="text-[#EF4444] mb-6" />
            <h2 className="text-[20px] font-medium text-[#F1F2F4] mb-2">Ödeme Başarısız</h2>
            <p className="text-[14px] text-[#7C8090] mb-8">
              Maalesef ödemeniz sırasında bir hata oluştu. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.
            </p>
            <div className="flex w-full space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-transparent border border-[#2A2D35] text-[#F1F2F4] font-medium text-[13px] py-2.5 rounded-[6px] hover:bg-[#1E2025] transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={() => navigate('/plans')}
                className="flex-1 bg-[#F5A623] text-[#0A0B0D] font-medium text-[13px] py-2.5 rounded-[6px] hover:bg-[#d9921e] transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
