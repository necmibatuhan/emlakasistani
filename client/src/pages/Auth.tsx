import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Turnstile } from '@marsidev/react-turnstile';
import axios from 'axios';
import { User, Building, Building2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { Logo } from '../components/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  
  const { login, register, setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/auth/google`, {
        credential: credentialResponse.credential
      });
      setUser(res.data.user);
      setToken(res.data.token); // FIX: Update AuthContext state
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
    
    // Bypass Captcha for Demo Accounts
    const demoEmails = ['demo@kapora.online'];
    const isDemoAccount = demoEmails.includes(email.toLowerCase().trim());

    // Sadece lokal test için devrede bırakılabilir, ama production'da zorunludur:
    if (!isDemoAccount && import.meta.env.VITE_TURNSTILE_SITE_KEY && import.meta.env.VITE_TURNSTILE_SITE_KEY !== 'GIRILECEK_TURNSTILE_SITE_KEY') {
      if (!captchaToken) {
        setError('Lütfen robot olmadığınızı doğrulayın.');
        return;
      }
    }
    
    if (isLogin) {
      try {
        await login(email, password, captchaToken);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Giriş başarısız.');
      }
    } else {
      if (!kvkkAccepted) {
        setError('Kayıt olmak için KVKK Aydınlatma Metni ve Gizlilik Politikasını onaylamanız gerekmektedir.');
        return;
      }
      setRegisterStep(2);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      const res = await axios.post(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/auth/forgot-password`, { 
        email, 
        turnstileToken: captchaToken 
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre sıfırlama isteği başarısız.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const res = await register(name, email, password, selectedRole, captchaToken, kvkkAccepted);
      if (res?.data?.token) {
        navigate('/dashboard');
      } else {
        setMessage(res?.data?.message || 'Kayıt başarılı. Lütfen e-postanıza gönderilen doğrulama linkine tıklayın.');
        setRegisterStep(1);
        setIsLogin(true);
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
      <div className="w-full max-w-[420px] md:max-w-[540px] bg-[#16181D] rounded-[16px] border border-[#2A2D35] p-8 md:p-10 relative shadow-2xl">
        {(isForgotPassword || (!isLogin && registerStep === 2)) && (
          <button 
            onClick={() => { isForgotPassword ? setIsForgotPassword(false) : setRegisterStep(1); }}
            className="absolute top-6 left-6 text-[#7C8090] hover:text-[#F1F2F4] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="flex justify-center mb-8 md:mb-8">
          <Logo iconSize="w-12 h-12 md:w-14 md:h-14" textSize="text-[28px] md:text-[32px]" />
        </div>
        
        <h2 className="text-[22px] md:text-[26px] font-bold text-center text-[#F1F2F4] mb-3 md:mb-4">
          {isForgotPassword ? 'Şifremi Unuttum' : (isLogin ? 'Tekrar Hoşgeldiniz (v2.1)' : (registerStep === 1 ? 'Hesap Oluşturun' : 'Profilinizi Seçin'))}
        </h2>
        
        <div className="text-center mb-8">
          <p className="text-[14px] md:text-[15px] text-[#7C8090]">
            {isForgotPassword 
              ? 'Hesabınıza kayıtlı e-posta adresini girin, size şifre sıfırlama bağlantısı gönderelim.'
              : isLogin 
                ? 'Emlak asistanınıza tekrar hoş geldiniz.' 
                : (registerStep === 1 
                  ? 'Dakikalar içinde yeni nesil Emlak Asistanı\'ini kullanmaya başlayın.'
                  : 'Platformu kullanım amacınıza en uygun rolü belirleyin.')}
          </p>
        </div>

        {message && <div className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 p-3 rounded-md mb-6 text-[13px] font-medium text-center">{message}</div>}
        {error && <div className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 p-3 rounded-md mb-6 text-[13px] text-center">{error}</div>}

        {isForgotPassword ? (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (import.meta.env.VITE_TURNSTILE_SITE_KEY && import.meta.env.VITE_TURNSTILE_SITE_KEY !== 'GIRILECEK_TURNSTILE_SITE_KEY' && !captchaToken) {
              setError('Lütfen robot olmadığınızı doğrulayın.');
              return;
            }
            handleForgotPassword(e);
          }}>
            <div className="mb-4">
              <label className="block text-[#7C8090] text-[12px] font-medium mb-1.5 uppercase tracking-wider">E-posta</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[8px] px-4 py-3 md:px-5 md:py-3.5 text-[#F1F2F4] text-[14px] md:text-[15px] focus:outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623] focus:bg-[#13151A] transition-all shadow-inner" 
                placeholder="ornek@sirket.com" 
              />
            </div>
            
            <div className="flex justify-center mt-4">
              {import.meta.env.VITE_TURNSTILE_SITE_KEY ? (
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                />
              ) : (
                <div className="p-3 bg-red-900/50 text-red-200 border border-red-500 rounded text-xs text-center w-full">
                  ⚠️ <b>Vercel Hatası:</b> VITE_TURNSTILE_SITE_KEY bulunamadı.<br/>
                  Lütfen Vercel ayarlarından ekleyip <b>Redeploy</b> yapın.
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#F5A623] text-[#0A0B0D] font-medium text-[13px] py-2.5 rounded-[6px] hover:bg-[#d9921e] transition-colors mt-2 disabled:opacity-50"
            >
              Şifre Sıfırlama Bağlantısı Gönder
            </button>
          </form>
        ) : isLogin || registerStep === 1 ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-[12px] font-medium text-[#7C8090] mb-1.5">Ad Soyad</label>
                  <input 
                    type="text" required 
                    className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[8px] px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-[15px] focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623] focus:bg-[#13151A] outline-none transition-all shadow-inner placeholder-[#7C8090]"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="md:mt-5">
                <label className="block text-[12px] md:text-[13px] font-medium text-[#7C8090] mb-1.5 md:mb-2">E-posta</label>
                <input 
                  type="email" required 
                  className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[8px] px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-[15px] focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623] focus:bg-[#13151A] outline-none transition-all shadow-inner placeholder-[#7C8090]"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="md:mt-5">
                <label className="block text-[12px] md:text-[13px] font-medium text-[#7C8090] mb-1.5 md:mb-2">Şifre</label>
                <input 
                  type="password" required 
                  className="w-full bg-[#0A0B0D] border border-[#2A2D35] text-[#F1F2F4] rounded-[8px] px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-[15px] focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623] focus:bg-[#13151A] outline-none transition-all shadow-inner placeholder-[#7C8090]"
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

              {isLogin && (
                <div className="mb-6 md:mb-8 flex justify-end mt-2 md:mt-3">
                  <button 
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(''); setMessage(''); }}
                    className="text-[13px] md:text-[15px] text-[#F5A623] hover:underline font-medium"
                  >
                    Şifremi unuttum
                  </button>
                </div>
              )}

              <div className="flex justify-center mt-4">
                {import.meta.env.VITE_TURNSTILE_SITE_KEY ? (
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setError('Cloudflare Turnstile bağlantısı engellendi. Lütfen reklam engelleyicinizi (Adblock) kapatın.')}
                  />
                ) : (
                  <div className="p-3 bg-red-900/50 text-red-200 border border-red-500 rounded text-xs text-center w-full">
                    ⚠️ <b>Vercel Hatası:</b> VITE_TURNSTILE_SITE_KEY bulunamadı.<br/>
                    Lütfen Vercel ayarlarından ekleyip <b>Redeploy</b> yapın.
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#F5A623] to-[#FF8C00] text-[#0A0B0D] font-bold text-[15px] md:text-[16px] py-4 md:py-3.5 rounded-[10px] hover:shadow-[0_0_25px_rgba(245,166,35,0.5)] transition-all mt-6 md:mt-5 disabled:opacity-50"
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
              <div className="mt-6 flex flex-col gap-3 justify-center items-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text={isLogin ? 'signin_with' : 'signup_with'}
                  shape="rectangular"
                  size="large"
                  theme="filled_black"
                />
                
                {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'GIRILECEK_GOOGLE_CLIENT_ID') && (
                  <button 
                    type="button"
                    onClick={() => handleGoogleSuccess({ credential: 'mock_google_credential' })}
                    className="w-[280px] bg-white text-black font-semibold text-[14px] py-2.5 rounded-[4px] hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                    Test (Mock) Google Login
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 text-center bg-[#1E2028]/80 p-4 md:p-5 rounded-[12px] border border-[#2A2D35]">
              <span className="text-[14px] md:text-[15px] text-[#7C8090] font-medium mr-2">
                {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
              </span>
              <button 
                onClick={() => { setIsLogin(!isLogin); setRegisterStep(1); setError(''); setMessage(''); }} 
                className="text-[14px] md:text-[15px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#ffaa00] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#ff7300] transition-all hover:underline"
              >
                {isLogin ? 'Hemen Kayıt Olun 🚀' : 'Giriş Yapın'}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
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


      </div>
    </div>
  );
};

export default Auth;
