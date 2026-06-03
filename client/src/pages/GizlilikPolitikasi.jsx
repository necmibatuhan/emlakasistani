import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GizlilikPolitikasi = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0B0D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#7C8090] hover:text-[#F1F2F4] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Geri Dön</span>
        </button>

        <div className="bg-[#16181D] border border-[#2A2D35] rounded-xl p-8 sm:p-12 shadow-2xl">
          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-[#2A2D35]">
            <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-full flex items-center justify-center text-[#3B82F6]">
              <Lock size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F1F2F4]">Gizlilik Politikası</h1>
              <p className="text-[#7C8090] mt-1">Verilerinizin Güvenliği Bizim İçin Önemlidir</p>
            </div>
          </div>

          <div className="space-y-8 text-[#A0A5B5] leading-relaxed text-[15px]">
            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">1. Toplanan Veriler ve Kullanım Amacı</h2>
              <p>
                Kapora olarak, yalnızca size daha iyi bir hizmet sunabilmek ve platformun temel CRM işlevlerini yerine getirebilmek için gerekli olan minimum veriyi toplarız. Bunlar, platforma kayıt olurken verdiğiniz profil bilgileriniz ile sisteme eklediğiniz müşteri (lead) kayıtlarından ibarettir.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">2. Yapay Zeka Entegrasyonu ve Üçüncü Taraflar</h2>
              <p>
                Platformumuz, notlarınızı analiz etmek için Google Gemini yapay zeka altyapısını kullanır. Verileriniz, yapay zekaya gönderilmeden önce sistemimiz içerisinde <strong>anonimleştirilir (maskelenir)</strong>. Maskeleme sayesinde müşteri isimleri, telefon numaraları ve mail adresleri yapay zekaya veya diğer üçüncü taraflara kesinlikle aktarılmaz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">3. Kullanıcı Hakları ve Veri Silme</h2>
              <p>
                Verileriniz üzerinde tam kontrole sahipsiniz. Hesabınızda bulunan verileri görüntüleme, dışa aktarma veya tamamen silme hakkına sahipsiniz. "Verilerimi Sil" özelliğini kullandığınızda, sistemimiz üzerinde size veya müşterilerinize ait olan tüm kalıntılar (veritabanı kayıtları, sesli notlar, eşleşmeler) anında ve geri getirilemez şekilde kalıcı olarak yok edilir.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">4. Çerezler (Cookies)</h2>
              <p>
                Platformumuzda kullanıcı deneyimini iyileştirmek, oturum güvenliğini sağlamak ve site performansını analiz etmek amacıyla zorunlu çerezler kullanılmaktadır. Reklam veya pazarlama amaçlı üçüncü taraf takip çerezleri (tracking cookies) kullanılmamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">5. İletişim</h2>
              <p>
                Gizlilik politikamız, verilerinizin nasıl işlendiği veya haklarınız hakkında sorularınız varsa, destek ekibimizle iletişime geçmekten çekinmeyin.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-[#2A2D35] text-sm text-[#7C8090]">
              <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GizlilikPolitikasi;
