import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { User, Building, Building2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [registerStep, setRegisterStep] = useState(1);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  
  const { login, register, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`, {
        credential: credentialResponse.credential
      });
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google ile giriş başarısız.');
    }
  };

  const handleGoogleError = () => {
    setError('Google ile giriş yapılırken bir hata oluştu.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Yalnızca lokal test için devrede bırakılabilir, ama production'da zorunludur:
    if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && import.meta.env.VITE_RECAPTCHA_SITE_KEY !== 'GIRILECEK_RECAPTCHA_SITE_KEY') {
      if (!captchaToken) {
        setError('Lütfen robot olmadığınızı doğrulayın.');
        return;
      }
    }
    
    if (isLogin) {
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Bir hata oluştu');
      }
    } else {
      if (!kvkkAccepted) {
        setError('Kayıt olmak için KVKK Aydınlatma Metni ve Gizlilik Politikasını onaylamanız gerekmektedir.');
        return;
      }
      setRegisterStep(2);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const res = await register(name, email, password, selectedRole);
      if (res.data.message) {
        setMessage(res.data.message);
        setIsLogin(true); 
        setRegisterStep(1);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu.');
      setRegisterStep(1); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#16181D] rounded-[10px] border border-[#2A2D35] p-8 relative">
        {!isLogin && registerStep === 2 && (
          <button 
            onClick={() => setRegisterStep(1)}
            className="absolute top-6 left-6 text-[#7C8090] hover:text-[#F1F2F4] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 bg-[#1E2025] rounded-[6px] flex items-center justify-center">
            <span className="text-[#F1F2F4] font-bold text-[16px] tracking-tight">EA</span>
          </div>
        </div>
        
        <h2 className="text-[20px] font-medium text-center text-[#F1F2F4] mb-8">
          {isLogin ? 'Tekrar Hoşgeldiniz' : (registerStep === 1 ? 'Hesap Oluşturun' : 'Profilinizi Seçin')}
        </h2>

        {message && <div className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 p-3 rounded-md mb-6 text-[13px] font-medium text-center">{message}</div>}
        {error && <div className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 p-3 rounded-md mb-6 text-[13px] text-center">{error}</div>}

        {isLogin || registerStep === 1 ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-[12px] font-medium text-[#7C8090] mb-1.5">Ad Soyad</label>
                  <input 
                    type="text" required 
                    className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors placeholder-[#7C8090]"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block text-[12px] font-medium text-[#7C8090] mb-1.5">E-posta</label>
                <input 
                  type="email" required 
                  className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors placeholder-[#7C8090]"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#7C8090] mb-1.5">Şifre</label>
                <input 
                  type="password" required 
                  className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[6px] p-2.5 text-[13px] focus:border-[#F5A623] outline-none transition-colors placeholder-[#7C8090]"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && registerStep === 1 && (
                <div className="flex items-start mt-4 mb-2">
                  <div className="flex items-center h-5">
                    <input
                      id="kvkk"
                      type="checkbox"
                      checked={kvkkAccepted}
                      onChange={(e) => setKvkkAccepted(e.target.checked)}
                      className="w-4 h-4 bg-[#1E2028] border border-[#2A2D35] rounded focus:ring-[#F5A623] focus:ring-offset-0 text-[#F5A623]"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="kvkk" className="text-[#7C8090] text-[12px] leading-snug cursor-pointer">
                      <a href="/aydinlatma-metni" target="_blank" rel="noopener noreferrer" className="text-[#F5A623] hover:underline">Aydınlatma Metni</a>'ni ve <a href="/gizlilik-politikasi" target="_blank" rel="noopener noreferrer" className="text-[#F5A623] hover:underline">Gizlilik Politikası</a>'nı okudum. Müşteri görüşmelerimin AI ile analiz edilmesine onay veriyorum.
                    </label>
                  </div>
                </div>
              )}

              {import.meta.env.VITE_RECAPTCHA_SITE_KEY && import.meta.env.VITE_RECAPTCHA_SITE_KEY !== 'GIRILECEK_RECAPTCHA_SITE_KEY' && (
                <div className="flex justify-center my-4">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    theme="dark"
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-[#F5A623] text-[#0A0B0D] font-medium text-[13px] py-2.5 rounded-[6px] hover:bg-[#d9921e] transition-colors mt-2"
              >
                {isLogin ? 'Giriş Yap' : 'Devam Et'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2A2D35]"></div>
                </div>
                <div className="relative flex justify-center text-[12px]">
                  <span className="px-2 bg-[#16181D] text-[#7C8090]">Veya</span>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text={isLogin ? 'signin_with' : 'signup_with'}
                  shape="rectangular"
                  size="large"
                  theme="filled_black"
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setRegisterStep(1); setError(''); setMessage(''); }} 
                className="text-[13px] text-[#7C8090] hover:text-[#F1F2F4] transition-colors font-medium"
              >
                {isLogin ? 'Hesabınız yok mu? Kayıt olun.' : 'Zaten hesabınız var mı? Giriş yapın.'}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-[13px] text-[#7C8090] mb-8">Size en uygun deneyimi sunabilmemiz için rolünüzü seçin.</p>
            
            <button 
              disabled={isSubmitting}
              onClick={() => handleRoleSelection('agent')}
              className="w-full text-left bg-[#0A0B0D] border border-[#2A2D35] p-4 rounded-[8px] hover:border-[#F5A623] hover:bg-[#1E2028] transition-colors flex items-center space-x-4 group disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-[#16181D] text-[#7C8090] rounded-[6px] flex items-center justify-center group-hover:text-[#F5A623] transition-colors">
                <User size={18} />
              </div>
              <div>
                <h4 className="font-medium text-[#F1F2F4] text-[13px]">Bireysel Danışmanım</h4>
                <p className="text-[12px] text-[#7C8090] mt-1">Sadece kendi portföyümü ve müşterilerimi yönetirim.</p>
              </div>
            </button>

            <button 
              disabled={isSubmitting}
              onClick={() => handleRoleSelection('office_manager')}
              className="w-full text-left bg-[#0A0B0D] border border-[#2A2D35] p-4 rounded-[8px] hover:border-[#F5A623] hover:bg-[#1E2028] transition-colors flex items-center space-x-4 group disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-[#16181D] text-[#7C8090] rounded-[6px] flex items-center justify-center group-hover:text-[#F5A623] transition-colors">
                <Building size={18} />
              </div>
              <div>
                <h4 className="font-medium text-[#F1F2F4] text-[13px]">Kendi Ofisim Var</h4>
                <p className="text-[12px] text-[#7C8090] mt-1">Hem danışmanlık yapar hem de ofisimi yönetirim.</p>
              </div>
            </button>

            <button 
              disabled={isSubmitting}
              onClick={() => handleRoleSelection('company_admin')}
              className="w-full text-left bg-[#0A0B0D] border border-[#2A2D35] p-4 rounded-[8px] hover:border-[#F5A623] hover:bg-[#1E2028] transition-colors flex items-center space-x-4 group disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-[#16181D] text-[#7C8090] rounded-[6px] flex items-center justify-center group-hover:text-[#F5A623] transition-colors">
                <Building2 size={18} />
              </div>
              <div>
                <h4 className="font-medium text-[#F1F2F4] text-[13px]">Şirket / Zincir Yöneticisi</h4>
                <p className="text-[12px] text-[#7C8090] mt-1">Birden fazla ofis ve yüzlerce danışmanı yönetirim.</p>
              </div>
            </button>
            {isSubmitting && <p className="text-center text-[12px] text-[#F5A623] animate-pulse mt-6">Kayıt oluşturuluyor...</p>}
          </div>
        )}

        {isLogin && (
          <div className="mt-8 pt-6 border-t border-[#2A2D35]">
            <p className="text-[10px] font-bold text-[#7C8090] uppercase tracking-[0.1em] text-center mb-4">Hızlı Demo Girişi</p>
            <div className="space-y-2">
              <button 
                onClick={() => { setEmail('admin@c21.com'); setPassword('123456'); }}
                className="w-full bg-transparent border border-[#2A2D35] text-[#7C8090] hover:text-[#F1F2F4] hover:bg-[#1E2028] text-[12px] font-medium py-2 rounded-[6px] transition-colors"
              >
                🏢 Şirket Yöneticisi (Admin) Olarak Doldur
              </button>
              <button 
                onClick={() => { setEmail('manager@c21.com'); setPassword('123456'); }}
                className="w-full bg-transparent border border-[#2A2D35] text-[#7C8090] hover:text-[#F1F2F4] hover:bg-[#1E2028] text-[12px] font-medium py-2 rounded-[6px] transition-colors"
              >
                👔 Ofis Yöneticisi (Manager) Olarak Doldur
              </button>
              <button 
                onClick={() => { setEmail('agent@c21.com'); setPassword('123456'); }}
                className="w-full bg-transparent border border-[#2A2D35] text-[#7C8090] hover:text-[#F1F2F4] hover:bg-[#1E2028] text-[12px] font-medium py-2 rounded-[6px] transition-colors"
              >
                👤 Danışman (Agent) Olarak Doldur
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
