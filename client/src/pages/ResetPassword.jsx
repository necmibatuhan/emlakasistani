import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Logo } from '../components/Logo';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const userId = searchParams.get('id');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('Şifreler birbiriyle uyuşmuyor.');
      return;
    }
    
    if (password.length < 6) {
      setError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/reset-password`, {
        userId,
        token,
        newPassword: password
      });
      
      setMessage(res.data.message);
      
      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu. Bağlantı süresi dolmuş olabilir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !userId) {
    return (
      <div className="min-h-screen bg-[#0A0B0D] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-[#16181D] rounded-[10px] border border-[#2A2D35] p-8 text-center">
          <Logo className="justify-center mb-6" />
          <h2 className="text-[20px] font-medium text-[#F1F2F4] mb-4">Geçersiz Bağlantı</h2>
          <p className="text-[14px] text-[#7C8090] mb-8">Bu şifre sıfırlama bağlantısı geçersiz veya eksik.</p>
          <Link to="/auth" className="text-[#F5A623] hover:underline text-[13px]">Giriş sayfasına dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#16181D] rounded-[10px] border border-[#2A2D35] p-8 relative">
        <div className="flex justify-center mb-8">
          <Logo iconSize="w-10 h-10" textSize="text-[24px]" />
        </div>
        
        <h2 className="text-[20px] font-medium text-center text-[#F1F2F4] mb-2">
          Yeni Şifre Belirleyin
        </h2>
        
        <div className="text-center mb-8">
          <p className="text-[14px] text-[#7C8090]">
            Hesabınız için yeni ve güvenli bir şifre girin.
          </p>
        </div>

        {message && <div className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 p-3 rounded-md mb-6 text-[13px] font-medium text-center">{message}</div>}
        {error && <div className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 p-3 rounded-md mb-6 text-[13px] text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#7C8090] text-[12px] font-medium mb-1.5 uppercase tracking-wider">Yeni Şifre</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-3 py-2.5 text-[#F1F2F4] text-[13px] focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-colors" 
              placeholder="••••••••" 
            />
          </div>

          <div className="mb-6">
            <label className="block text-[#7C8090] text-[12px] font-medium mb-1.5 uppercase tracking-wider">Yeni Şifre (Tekrar)</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-3 py-2.5 text-[#F1F2F4] text-[13px] focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-colors" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !!message}
            className="w-full bg-[#F5A623] text-[#0A0B0D] font-medium text-[13px] py-2.5 rounded-[6px] hover:bg-[#d9921e] transition-colors mt-2 disabled:opacity-50"
          >
            Şifreyi Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
