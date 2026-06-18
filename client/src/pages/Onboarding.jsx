import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Wallet, Home, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/Logo';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    budget: '',
    locations: '',
    transactionType: 'buy'
  });

  // Mock Score State
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (step === 1 && (!formData.name || !formData.phone)) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setStep(prev => prev + 1);
      setIsAnimating(false);
      
      // If moving to step 3, calculate mock score
      if (step === 2) {
        const randomScore = Math.floor(Math.random() * (95 - 70 + 1) + 70);
        setTargetScore(randomScore);
      }
    }, 300);
  };

  const handleSkipStep2 = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(3);
      setIsAnimating(false);
      const randomScore = Math.floor(Math.random() * (95 - 70 + 1) + 70);
      setTargetScore(randomScore);
    }, 300);
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const handleAddAnother = () => {
    setFormData({ name: '', phone: '', budget: '', locations: '', transactionType: 'buy' });
    setScore(0);
    setTargetScore(0);
    setStep(1);
  };

  // Animate Score Counter
  useEffect(() => {
    if (step === 3 && score < targetScore) {
      const timer = setTimeout(() => {
        setScore(prev => Math.min(prev + 2, targetScore));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [step, score, targetScore]);

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="p-6 relative z-10 flex justify-center">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-8 px-4 pb-12 relative z-10">
        
        {/* Progress Bar */}
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map(i => (
              <span key={i} className={`text-xs font-semibold ${step >= i ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                Adım {i}
              </span>
            ))}
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className={`w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-6 mx-auto">
                <User className="text-primary" size={24} />
              </div>
              <h2 className="text-2xl font-display-md font-bold text-center text-on-surface mb-2">İlk Müşterinizi Ekleyin</h2>
              <p className="text-on-surface-variant text-center mb-8 font-body-sm">
                Kapora'nın AI gücünü görmek için görüştüğünüz ilk kişiyi ekleyin.
              </p>

              <form onSubmit={handleNext} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Ad Soyad</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-on-surface-variant/50" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Telefon Numarası</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-on-surface-variant/50" />
                    </div>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                      placeholder="0555 555 5555"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={!formData.name || !formData.phone}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-[#18181B] font-semibold py-3.5 rounded-xl transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-6 mx-auto">
                <Target className="text-primary" size={24} />
              </div>
              <h2 className="text-2xl font-display-md font-bold text-center text-on-surface mb-2">Müşteri Tercihleri</h2>
              <p className="text-on-surface-variant text-center mb-8 font-body-sm">
                AI'ın doğru portföyü eşleştirmesi için detay ekleyin. (Opsiyonel)
              </p>

              <form onSubmit={handleNext} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Bütçe Aralığı</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wallet className="h-5 w-5 text-on-surface-variant/50" />
                    </div>
                    <select 
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface appearance-none"
                    >
                      <option value="" disabled>Seçiniz</option>
                      <option value="<2M">2 Milyon ₺ altı</option>
                      <option value="2-5M">2 - 5 Milyon ₺</option>
                      <option value="5-10M">5 - 10 Milyon ₺</option>
                      <option value="10M+">10 Milyon ₺ üzeri</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Tercih Edilen İlçe/Semt</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-on-surface-variant/50" />
                    </div>
                    <input 
                      type="text" 
                      value={formData.locations}
                      onChange={e => setFormData({...formData, locations: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                      placeholder="Örn: Kadıköy, Üsküdar"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">İşlem Tipi</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formData.transactionType === 'buy' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant'}`}>
                      <input type="radio" name="transaction" value="buy" checked={formData.transactionType === 'buy'} onChange={() => setFormData({...formData, transactionType: 'buy'})} className="hidden" />
                      <Home size={18} />
                      <span className="font-medium">Satın Alma</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formData.transactionType === 'rent' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant'}`}>
                      <input type="radio" name="transaction" value="rent" checked={formData.transactionType === 'rent'} onChange={() => setFormData({...formData, transactionType: 'rent'})} className="hidden" />
                      <User size={18} />
                      <span className="font-medium">Kiralama</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-[#18181B] font-semibold py-3.5 rounded-xl transition-all"
                  >
                    AI Skoru Hesapla
                    <ArrowRight size={18} />
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSkipStep2}
                    className="w-full flex items-center justify-center text-on-surface-variant hover:text-on-surface font-medium py-2 transition-all"
                  >
                    Şimdi Atla
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="p-8 flex flex-col items-center">
              
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container-high" />
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * score) / 100} className="text-[#10B981] transition-all duration-100 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-display-lg font-bold text-on-surface">{score}</span>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">SKOR</span>
                </div>
              </div>

              <h2 className="text-2xl font-display-md font-bold text-center text-on-surface mb-2">
                Harika! Müşteri Eklendi
              </h2>
              
              <div className="bg-surface-container-high rounded-xl p-4 mb-8 w-full border border-outline-variant/50">
                <div className="flex gap-2 items-start text-on-surface-variant mb-2">
                  <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm">Yeni eklendi, aciliyet yüksek.</span>
                </div>
                <div className="flex gap-2 items-start text-on-surface-variant mb-2">
                  <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm">{formData.budget ? 'Yüksek bütçe potansiyeli.' : 'Profil güçlendirilmeli.'}</span>
                </div>
                <div className="flex gap-2 items-start text-on-surface-variant">
                  <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm">Tercih edilen bölgede 3 uygun portföy var.</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={handleComplete}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-[#18181B] font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(253,224,71,0.3)] hover:shadow-[0_0_25px_rgba(253,224,71,0.5)]"
                >
                  Dashboard'a Git
                  <ArrowRight size={18} />
                </button>
                <button 
                  onClick={handleAddAnother}
                  className="w-full flex items-center justify-center text-on-surface-variant hover:text-on-surface font-medium py-2 transition-all"
                >
                  Bir Müşteri Daha Ekle
                </button>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Onboarding;
