import React, { useState } from 'react';

export default function Step2Survey({ onNext }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [feedback, setFeedback] = useState('');

  const reasons = [
    'Fiyat çok yüksek',
    'İhtiyacım olan özellik yok',
    'Kullanımı zor buldum',
    'Başka bir araç kullanmaya başladım',
    'Emlak işine ara veriyorum',
    'Diğer'
  ];

  const handleNext = () => {
    if (!selectedReason) return;
    onNext(selectedReason, feedback);
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-on-surface mb-2">Neyi daha iyi yapabilirdik?</h2>
      <p className="text-on-surface-variant text-sm mb-6">Size daha iyi hizmet verebilmemiz için lütfen ayrılma nedeninizi bizimle paylaşın.</p>

      <div className="space-y-3 mb-6">
        {reasons.map((reason) => (
          <label 
            key={reason} 
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedReason === reason ? 'border-primary bg-primary/5' : 'border-outline/30 hover:border-outline'}`}
          >
            <input 
              type="radio" 
              name="cancelReason" 
              value={reason} 
              checked={selectedReason === reason}
              onChange={() => setSelectedReason(reason)}
              className="w-4 h-4 text-primary bg-surface border-outline focus:ring-primary focus:ring-2"
            />
            <span className="text-on-surface font-medium">{reason}</span>
          </label>
        ))}
      </div>

      {(selectedReason === 'Diğer' || selectedReason === 'İhtiyacım olan özellik yok' || selectedReason === 'Başka bir araç kullanmaya başladım') && (
        <div className="mb-6 animate-fade-in">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={selectedReason === 'Başka bir araç kullanmaya başladım' ? "Hangi aracı kullanmaya başladınız?" : "Lütfen biraz daha detay verin..."}
            className="w-full bg-surface-container border border-outline/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary min-h-[100px]"
          ></textarea>
        </div>
      )}

      <button 
        onClick={handleNext}
        disabled={!selectedReason}
        className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Devam Et
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </button>
    </div>
  );
}
