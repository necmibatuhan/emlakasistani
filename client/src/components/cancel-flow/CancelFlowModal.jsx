import React, { useState } from 'react';
import axios from 'axios';
import Step1LossAversion from './Step1LossAversion';
import Step2Survey from './Step2Survey';
import Step3Offer from './Step3Offer';
import Step4SoftExit from './Step4SoftExit';

export default function CancelFlowModal({ isOpen, onClose, token }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    // Sadece Adım 1'deysak modalı dışarıdan kapatmaya izin ver, diğerlerinde çıkışı zorlaştır
    if (step === 1) {
      onClose();
    }
  };

  const handleSurveyNext = async (selectedReason, feedback) => {
    setLoading(true);
    setReason(selectedReason);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/subscription/cancel-reason`, {
        reason: selectedReason,
        feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOffer(res.data.offer);
      setStep(3); // Go to offer step
    } catch (err) {
      console.error(err);
      setStep(4); // If error, skip offer and go to soft exit
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/subscription/accept-offer`, {
        offer_type: offer.type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Tebrikler, teklif uygulandı!');
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/subscription/confirm-cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCancelled(true);
      setTimeout(() => {
        window.location.reload(); // Reload to reflect changes
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('İptal işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (isCancelled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
        <div className="relative bg-surface border border-outline/20 rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-[#10B981]/20 text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Abonelik İptal Edildi</h2>
          <p className="text-on-surface-variant">Hesabınızın süresi dolana kadar kullanmaya devam edebilirsiniz. Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>
      
      <div className="relative bg-surface border border-outline/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300">
        
        {/* Progress Bar */}
        <div className="sticky top-0 w-full bg-surface z-10 border-b border-outline/20 p-4 flex items-center justify-between">
          <div className="text-sm font-bold text-on-surface-variant">
            Adım {step}/4
          </div>
          {step === 1 && (
            <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Dynamic Content */}
        <div className="bg-surface">
          {step === 1 && (
            <Step1LossAversion 
              token={token} 
              onCancel={onClose} 
              onNext={() => setStep(2)} 
              onDirectExit={() => setStep(4)} 
            />
          )}
          
          {step === 2 && (
            <Step2Survey 
              onNext={handleSurveyNext} 
            />
          )}

          {step === 3 && (
            <Step3Offer 
              offer={offer}
              reason={reason}
              loading={loading}
              onAccept={handleAcceptOffer}
              onReject={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <Step4SoftExit 
              token={token}
              loading={loading}
              onConfirm={handleConfirmCancel}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
