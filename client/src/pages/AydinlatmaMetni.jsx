import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AydinlatmaMetni = () => {
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
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981]">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F1F2F4]">KVKK Aydınlatma Metni</h1>
              <p className="text-[#7C8090] mt-1">Emlak Asistanı Veri İşleme Politikaları</p>
            </div>
          </div>

          <div className="space-y-8 text-[#A0A5B5] leading-relaxed text-[15px]">
            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">1. Veri İşleme Amacımız</h2>
              <p>
                Emlak Asistanı olarak öncelikli amacımız, gayrimenkul danışmanlarının iş süreçlerini hızlandırmak, müşteri görüşmelerini (lead) dijital ortamda düzenlemek ve akıllı bir CRM kaydı oluşturmaktır. Toplanan veriler, yalnızca sizin işinizi kolaylaştırmak ve portföy eşleştirmelerini otomatize etmek için kullanılır.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">2. Yapay Zeka (AI) ve Veri Anonimleştirme</h2>
              <p>
                Uygulamamız, müşteri notlarınızı analiz etmek için gelişmiş yapay zeka (Google Gemini) altyapısı kullanmaktadır. <strong>En büyük önceliğimiz gizliliğinizdir.</strong> Sisteme girdiğiniz notlar yapay zekaya gönderilmeden önce özel PII (Kişisel Tanımlanabilir Bilgi) filtrelerimizden geçer. Müşterilerinizin isim, telefon ve e-posta gibi kişisel bilgileri "maskelenir".
              </p>
              <p className="mt-3 text-[#F5A623] font-medium">
                Önemli: Müşteri verileriniz hiçbir zaman yapay zeka modellerinin eğitilmesi (training) amacıyla kullanılmaz ve dış dünyayla paylaşılmaz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">3. Veri Saklama ve İmha Politikası</h2>
              <p>
                Sistemimize kaydettiğiniz tüm müşteri verileri uçtan uca şifrelenerek KVKK uyumlu, güvenli veri merkezlerinde saklanmaktadır. Verilerinizin kontrolü tamamen sizin elinizdedir. Profil ayarlarınız üzerinden "Tüm Verilerimi Sil" butonunu kullanarak veri tabanımızdaki tüm müşteri kayıtlarınızı, analizlerinizi ve hesabınızı kalıcı olarak, geri döndürülemez şekilde silebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#F1F2F4] mb-3">4. Teknik Güvenlik Önlemleri</h2>
              <p>
                Sistemimiz, endüstri standardı güvenlik protokolleri (SSL/TLS uçtan uca şifreleme) ile korunmaktadır. Ayrıca sistemdeki her kullanıcı sadece kendi ofisine ve kendi kayıtlarına erişebilir. Veri sızıntılarını önlemek adına "Zero Retention" (Sıfır Bekletme) ilkeleri uygulanır; yapay zeka analiz işlemi bittikten hemen sonra işlem yapılan geçici bellek silinir.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-[#2A2D35] text-sm text-[#7C8090]">
              <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
              <p className="mt-2">Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca hazırlanmıştır.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AydinlatmaMetni;
