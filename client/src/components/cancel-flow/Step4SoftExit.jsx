import React from 'react';
import axios from 'axios';

export default function Step4SoftExit({ token, onConfirm, onCancel, loading }) {
  
  const handleExport = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/subscription/export-data`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'kapora_verilerim.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Veriler dışa aktarılırken bir hata oluştu.');
    }
  };

  return (
    <div className="p-6 md:p-8 text-center">
      <div className="w-16 h-16 bg-surface-container-highest text-on-surface rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-3xl">waving_hand</span>
      </div>
      
      <h2 className="text-2xl font-bold text-on-surface mb-2">Üzgünüz, görüşmek üzere 👋</h2>
      <p className="text-on-surface-variant text-sm mb-8">
        Umarız gelecekte tekrar yollarımız kesişir. Hesabınızla ilgili bilmeniz gerekenler:
      </p>

      <ul className="text-left space-y-4 mb-8 bg-surface-container-lowest p-5 rounded-xl border border-outline/20">
        <li className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
          <div>
            <strong className="text-on-surface block">Verileriniz güvende</strong>
            <span className="text-sm text-on-surface-variant">Tüm verileriniz 90 gün boyunca korunacak.</span>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]">restart_alt</span>
          <div>
            <strong className="text-on-surface block">İstediğiniz zaman dönebilirsiniz</strong>
            <span className="text-sm text-on-surface-variant">Geri döndüğünüzde kaldığınız yerden, aynı avantajlı fiyattan devam edebilirsiniz.</span>
          </div>
        </li>
      </ul>

      <button 
        onClick={handleExport}
        className="w-full bg-surface-container hover:bg-outline-variant text-on-surface font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6 border border-outline/50"
      >
        <span className="material-symbols-outlined text-lg">download</span>
        Müşteri Verilerimi CSV Olarak İndir
      </button>

      <div className="flex flex-col gap-3">
        <button 
          onClick={onCancel}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-lg transition-colors"
        >
          Fikrimi Değiştirdim, Kalıyorum
        </button>
        <button 
          onClick={onConfirm}
          disabled={loading}
          className="w-full bg-error/10 hover:bg-error/20 text-error font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'İptal Ediliyor...' : 'İptali Onayla — Kesin'}
        </button>
      </div>
    </div>
  );
}
