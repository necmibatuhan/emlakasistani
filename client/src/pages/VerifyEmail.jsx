import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Geçersiz bağlantı.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.post('http://localhost:5001/api/auth/verify-email', { token });
        setStatus('success');
        setMessage(res.data.message);
        setTimeout(() => {
          navigate('/auth');
        }, 4000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Doğrulama başarısız oldu.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#16181D] rounded-[10px] border border-[#2A2D35] p-8 text-center shadow-xl">
        {status === 'loading' && (
          <div>
            <div className="w-10 h-10 border-[3px] border-[#2A2D35] border-t-[#F5A623] rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-[18px] font-medium text-[#F1F2F4]">Doğrulanıyor...</h2>
            <p className="text-[13px] text-[#7C8090] mt-2">Lütfen bekleyin, e-postanız doğrulanıyor.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#10B981]/20">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-[20px] font-medium text-[#F1F2F4] mb-2">Başarılı!</h2>
            <p className="text-[13px] text-[#7C8090] mb-8">{message}</p>
            <p className="text-[11px] font-medium text-[#F5A623] uppercase tracking-wider animate-pulse">Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-[#EF4444]/10 text-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#EF4444]/20">
              <XCircle size={32} />
            </div>
            <h2 className="text-[20px] font-medium text-[#F1F2F4] mb-2">Hata!</h2>
            <p className="text-[13px] text-[#7C8090] mb-8">{message}</p>
            <button onClick={() => navigate('/auth')} className="w-full bg-[#1E2025] hover:bg-[#2A2D35] text-[#F1F2F4] font-medium text-[13px] py-2.5 rounded-[6px] border border-[#2A2D35] transition-colors">
              Giriş Sayfasına Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
