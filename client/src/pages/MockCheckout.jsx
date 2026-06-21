import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { Logo } from '../components/Logo';

export default function MockCheckout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token, setUser } = useContext(AuthContext);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Protect route & check session
  useEffect(() => {
    if (!state || !state.plan || !state.sessionId) {
      navigate('/plans');
    }
  }, [state, navigate]);

  if (!state) return null;

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val.substring(0, 19));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setExpiry(val);
  };

  const handleCvcChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    setCvc(val.substring(0, 3));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3 || !name) {
      setError('Lütfen tüm kart bilgilerini eksiksiz doldurun.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Ödemeyi simüle et (2 saniye bekle)
      await new Promise(res => setTimeout(res, 2000));

      // callback isteği
      await axios.post(
        `${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/payment/mock-callback`,
        { plan: state.plan, success: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch user again to get the updated plan
      const userRes = await axios.get(`${(import.meta.env.PROD ? "" : "http://localhost:5001")}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);

      navigate('/payment-result?status=success');
    } catch (err) {
      setError(err.response?.data?.message || 'Ödeme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex flex-col">
      {/* Navbar */}
      <div className="w-full bg-[#16181D] border-b border-[#2A2D35] px-6 py-4 flex items-center justify-between">
        <Logo iconSize="w-8 h-8" textSize="text-[20px]" />
        <div className="flex items-center text-[#7C8090] text-sm">
          <ShieldCheck className="w-4 h-4 mr-1 text-[#10B981]" />
          256-bit SSL Güvenli Ödeme
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <button 
          onClick={() => navigate('/plans')}
          className="flex items-center text-[#7C8090] hover:text-[#F1F2F4] mb-6 transition-colors self-start max-w-4xl mx-auto w-full px-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Planlara Dön
        </button>

        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 px-4">
          
          {/* Sol: Sipariş Özeti */}
          <div className="flex-1 bg-[#16181D] rounded-xl border border-[#2A2D35] p-6 h-fit">
            <h2 className="text-[#F1F2F4] font-medium text-lg mb-6">Sipariş Özeti</h2>
            
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#2A2D35]">
              <div>
                <p className="text-[#F1F2F4] font-medium">Kapora {state.plan === 'proplus' ? 'PRO+' : 'PRO'} Planı</p>
                <p className="text-[#7C8090] text-sm mt-1">Aylık Abonelik</p>
              </div>
              <p className="text-[#F1F2F4] font-medium">{state.price} ₺</p>
            </div>
            
            <div className="flex justify-between items-center mb-6 text-sm">
              <p className="text-[#7C8090]">KDV (%20)</p>
              <p className="text-[#F1F2F4]">Dahil</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-[#F1F2F4] font-medium text-lg">Toplam</p>
              <p className="text-[#F5A623] font-bold text-2xl">{state.price} ₺</p>
            </div>
            
            <div className="mt-8 bg-[#0A0B0D] rounded-lg p-4 flex items-start gap-3 border border-[#2A2D35]">
              <CheckCircle2 className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#F1F2F4] text-sm font-medium">Sanal Ödeme Sistemi</p>
                <p className="text-[#7C8090] text-xs mt-1">
                  Bu ekran bir simülasyondur. Girdiğiniz kart numarasıyla gerçek bir çekim yapılmaz. Test etmek için rastgele sayılar girebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          {/* Sağ: Kart Bilgileri */}
          <div className="flex-[1.5] bg-[#16181D] rounded-xl border border-[#2A2D35] p-6 shadow-2xl">
            <h2 className="text-[#F1F2F4] font-medium text-lg mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-[#7C8090]" />
              Kart Bilgileri
            </h2>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm p-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[12px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Kart Üzerindeki İsim</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-3 py-3 text-[#F1F2F4] text-[14px] focus:outline-none focus:border-[#F5A623] transition-colors"
                  placeholder="AD SOYAD"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[12px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Kart Numarası</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] pl-10 pr-3 py-3 text-[#F1F2F4] text-[14px] focus:outline-none focus:border-[#F5A623] transition-colors tracking-widest font-mono"
                    placeholder="0000 0000 0000 0000"
                  />
                  <CreditCard className="w-5 h-5 text-[#7C8090] absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Son Kullanma (AY/YIL)</label>
                  <input 
                    type="text" 
                    required
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-3 py-3 text-[#F1F2F4] text-[14px] focus:outline-none focus:border-[#F5A623] transition-colors text-center font-mono"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-[#7C8090] mb-1.5 uppercase tracking-wider">Güvenlik Kodu (CVC)</label>
                  <input 
                    type="text" 
                    required
                    value={cvc}
                    onChange={handleCvcChange}
                    className="w-full bg-[#0A0B0D] border border-[#2A2D35] rounded-[6px] px-3 py-3 text-[#F1F2F4] text-[14px] focus:outline-none focus:border-[#F5A623] transition-colors text-center font-mono"
                    placeholder="123"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-[#F5A623] text-[#0A0B0D] font-medium text-[15px] py-3.5 rounded-[6px] hover:bg-[#d9921e] transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-[#0A0B0D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Ödeme İşleniyor...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {state.price} ₺ Öde ve Abone Ol
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
