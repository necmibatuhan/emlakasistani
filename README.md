# Kapora

> Gayrimenkul danışmanlarının müşteri takibini, portföy eşleştirmeyi ve günlük satış aksiyonlarını tek merkezde yöneten yapay zekâ destekli emlak CRM’i.

**Canlı uygulama:** [kapora.online](https://kapora.online)

**API:** [emlakasistani.onrender.com](https://emlakasistani.onrender.com)

## Kapora nedir?

Kapora; bireysel gayrimenkul danışmanları, emlak ofisleri ve çok şubeli şirketler için geliştirilmiş bir müşteri ilişkileri ve satış takip platformudur.

Bir emlak danışmanının günlük problemi yalnızca müşteri bulmak değildir. Hangi müşterinin daha değerli olduğunu hatırlamak, görüşme notlarını düzenli tutmak, doğru portföyü doğru kişiyle eşleştirmek ve zamanında geri dönüş yapmak da gerekir. Bu işler çoğunlukla WhatsApp konuşmaları, telefon notları, ajandalar ve Excel dosyaları arasında dağılır.

Kapora bu dağınık süreci tek bir çalışma alanında toplar:

1. Müşteri talebi sisteme alınır.
2. Yapay zekâ talebi analiz eder ve önceliklendirir.
3. Uygun portföyler müşteriyle eşleştirilir.
4. Danışmana bir sonraki en doğru aksiyon gösterilir.
5. Görüşme, not, hatırlatıcı ve satış süreci müşteri kartında saklanır.

Kapora’nın temel amacı daha fazla veri toplamak değil, danışmana her gün şu sorunun cevabını vermektir:

> **“Bugün kiminle, neden ve hangi mesajla iletişime geçmeliyim?”**

## Kimler için?

### Gayrimenkul danışmanı

- Kendi müşteri ve portföy havuzunu yönetir.
- Günün öncelikli müşterilerini görür.
- Sesli nottan müşteri oluşturabilir.
- Görüşme notu, görev ve hatırlatıcı ekler.
- Hazır WhatsApp taslağı ve portföy önerileri kullanır.

### Ofis yöneticisi

- Ofise bağlı danışmanları ve müşteri dağılımını izler.
- Ofis performansını ve satış hunisini takip eder.
- Portföyleri ve ekip aktivitelerini ortak merkezden yönetir.

### Şirket yöneticisi

- Birden fazla ofisi tek yapı altında yönetir.
- Şirket, ofis ve danışman seviyesinde raporlama yapar.
- Yetki ve rol bazlı erişim kullanır.

## Ürünün temel yetenekleri

### 1. Akıllı müşteri yönetimi

Müşterinin adı, iletişim bilgisi, talebi, bütçesi, bölgesi, oda tercihi, durumu ve görüşme geçmişi tek kartta tutulur.

Kapora müşterileri yalnızca listelemez; aşağıdaki sinyallere göre önceliklendirir:

- Müşteri sıcaklık skoru
- Son görüşmeden beri geçen süre
- Gecikmiş takip veya hatırlatıcı
- Bütçe potansiyeli
- Portföy eşleşme sayısı
- Satış sürecindeki mevcut aşama

Müşteriler **Sıcak**, **Ilık** ve **Soğuk** olarak sınıflandırılabilir. Satış süreci; takip, arama, randevu, teklif, sözleşme ve tamamlanma aşamalarında izlenir.

### 2. Günün öncelikleri

Ana ekrandaki öncelik motoru, danışmanın tüm müşteri havuzunu değerlendirerek bugün ilgilenilmesi gereken kişileri sıralar.

Öncelik skoru şu verilerden oluşur:

- CRM müşteri skoru
- Gerçek son aktivite tarihi
- Sessiz kalınan gün sayısı
- Takip zamanının gelip gelmediği
- Müşterinin açık durumdaki satış süreci

Böylece yüksek skorlu fakat yeni görüşülmüş bir müşteri ile orta skorlu fakat uzun süredir bekleyen müşteri aynı şekilde değerlendirilmez.

### 3. Sesli nottan müşteri oluşturma

Danışman sahadayken form doldurmak yerine müşteri görüşmesini doğal biçimde anlatabilir.

Örnek:

> “Ayşe Hanım Kadıköy’de 3+1 satılık daire arıyor. Bütçesi sekiz milyon. Yarın saat 14.00’te tekrar arayacağım.”

Kapora bu kayıttan şunları çıkarmayı hedefler:

- Müşteri adı ve telefonu
- Bölge ve gayrimenkul tipi
- Oda tercihi ve bütçe
- Aciliyet ve müşteri sıcaklığı
- Önerilen sonraki aksiyon
- WhatsApp mesaj taslağı
- Tarih belirtilmişse görev veya randevu

Sesli kayıt doğrudan kaydedilmez. Önce düzenlenebilir bir müşteri taslağı gösterilir; danışman bilgileri kontrol edip onayladıktan sonra müşteri kartı oluşturulur.

Tarayıcı tarafında Chrome, Edge ve Safari’nin desteklediği WebM/Opus ve MP4 ses biçimleri ele alınır. Çok kısa veya boş kayıtlar işleme gönderilmez.

### 4. Akıllı ajanda ve hatırlatıcılar

Görüşme notunda “yarın ara”, “pazartesi gösterim var” veya belirli bir saat gibi ifadeler geçtiğinde Kapora bunu yapılandırılmış takvim verisine dönüştürür.

- Müşteri kartına hatırlatıcı eklenir.
- Ana ekrandaki ajandada gösterilir.
- Takvim dışa aktarma akışı üzerinden `.ics` biçiminde kullanılabilir.
- Tarihi geçen görevler günlük öncelik skorunu yükseltir.

### 5. Portföy yönetimi ve eşleştirme

Portföylerde şu temel bilgiler tutulur:

- Satılık veya kiralık türü
- Konut, işyeri veya diğer kategori
- Şehir, ilçe ve adres
- Fiyat, metrekare, oda ve kat
- Fotoğraflar ve ek özellikler
- Aktif, rezerve, satıldı veya pasif durumu

Yeni müşteri eklendiğinde uygun portföyler aranır. Yeni portföy eklendiğinde ise mevcut müşteri havuzu tekrar taranır. Eşleştirme sırasında bölge, oda sayısı, bütçe ve müşteri talebi değerlendirilir.

Bulunan eşleşmeler müşteri kartına kaydedilir ve günlük satış brifinginde danışmana gösterilir.

### 6. Günlük satış brifingi

Kapora sabah özetinde danışmana yalnızca istatistik değil, doğrudan aksiyon listesi sunar:

- En sıcak müşteriler
- Yedi günden uzun süredir temas edilmeyen müşteriler
- Henüz müşteriye gösterilmemiş yeni portföy eşleşmeleri
- Uzun süredir sonuçlanmayan portföyler
- Günün satış odağı

### 7. WhatsApp destekli takip

Kapora müşteri bağlamına göre kişiselleştirilmiş WhatsApp mesaj taslakları oluşturabilir. Danışman taslağı kontrol ettikten sonra WhatsApp akışında kullanabilir.

Twilio/WhatsApp Business yapılandırıldığında gelen mesajların sisteme alınması için webhook altyapısı da bulunur.

### 8. İlan analizi

İlan fotoğrafı ve açıklaması yapay zekâ ile değerlendirilebilir. Analiz; görsel kalite, açıklama gücü, pazarlama potansiyeli ve iyileştirme önerileri üretmek üzere tasarlanmıştır.

### 9. Raporlama ve organizasyon yapısı

- Şirket, ofis ve danışman rolleri
- Rol bazlı dashboard
- Müşteri dağılımı ve durum raporları
- İstatistikler ve performans görünümü
- CSV/PDF odaklı rapor akışları
- Abonelik ve plan yönetimi

## Tipik kullanıcı akışı

```text
Müşteri görüşmesi
      │
      ├── Manuel form
      ├── Sesli kayıt
      └── Entegrasyon / WhatsApp
              │
              ▼
       Yapay zekâ analizi
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   Skorlama  Talep   Görev/Randevu
      │       │        │
      └───────┼────────┘
              ▼
         Müşteri kartı
              │
              ▼
       Portföy eşleştirme
              │
              ▼
   Günlük öncelik ve takip aksiyonu
```

## Teknoloji mimarisi

### İstemci

- React 19
- Vite ve `vite-react-ssg`
- React Router
- TanStack Query
- Tailwind CSS
- PWA desteği
- Vercel Analytics ve Speed Insights

### Sunucu

- Node.js 22
- Express 5
- TypeScript/TSX çalışma zamanı
- JWT tabanlı oturum doğrulama
- Multer ile bellek içi dosya yükleme
- Zod tabanlı istek doğrulama
- Helmet, CORS ve API rate limiting

### Veri ve yapay zekâ

- PostgreSQL / Supabase
- Google Gemini: ses transkripsiyonu ve yapılandırılmış CRM analizi
- OpenAI: embedding, semantik arama ve ilan analizi gibi yardımcı AI işlevleri
- Supabase Storage: yapılandırıldığında ilan görselleri
- Arka plan eşleştirme kuyruğu

### Dağıtım

- Frontend: Vercel
- Backend: Render
- Veritabanı: Supabase PostgreSQL
- `/api/*` istekleri Vercel rewrite üzerinden Render API’ye yönlendirilir.

## Proje yapısı

```text
app/
├── client/                     # React uygulaması
│   ├── src/
│   │   ├── components/         # Ortak UI ve ürün bileşenleri
│   │   ├── contexts/           # Auth ve UI durumları
│   │   ├── data/               # Statik içerikler
│   │   ├── hooks/              # React hook'ları
│   │   └── pages/              # Sayfa ve dashboard'lar
│   └── public/                 # PWA ve statik dosyalar
├── server/
│   ├── db/                     # PostgreSQL bağlantısı ve temel şema
│   ├── middleware/             # Auth ve doğrulama katmanı
│   ├── migrations/             # Veritabanı değişiklikleri
│   ├── routes/                 # REST API uçları
│   ├── services/               # AI, e-posta, kuyruk ve iş servisleri
│   ├── utils/                  # Prompt ve gizlilik yardımcıları
│   └── index.ts                # Express başlangıç noktası
├── vercel.json                 # Build ve API rewrite ayarları
└── README.md
```

## Yerel geliştirme

### Gereksinimler

- Node.js 22.x
- npm
- PostgreSQL veya Supabase projesi
- AI özellikleri için en az bir Gemini API anahtarı

### 1. Depoyu hazırlayın

```bash
git clone <repository-url>
cd emlakasistani
```

### 2. Backend’i kurun

```bash
cd server
npm install
# server/.env dosyasını oluşturup aşağıdaki ortam değişkenlerini ekleyin.
npm run dev
```

Backend varsayılan olarak `http://localhost:5001` adresinde çalışır.

### 3. Frontend’i kurun

Yeni terminalde:

```bash
cd client
npm install
npm run dev
```

Frontend varsayılan olarak `http://localhost:5173` adresinde çalışır.

### 4. Üretim derlemesi

```bash
cd client
npm run build
```

Backend üretim başlangıcı:

```bash
cd server
npm start
```

## Ortam değişkenleri

Gerçek değerleri repoya eklemeyin. Secret değerlerini yerel `.env`, Vercel Environment Variables veya Render Environment üzerinden yönetin.

### Zorunlu backend değişkenleri

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL/Supabase bağlantı adresi |
| `JWT_SECRET` | JWT imzalama anahtarı |
| `GEMINI_API_KEY` | Ses ve CRM analizi için Gemini anahtarı |
| `FRONTEND_URL` | İzin verilen frontend adresi |
| `APP_URL` | E-posta ve bildirim bağlantılarında kullanılan uygulama adresi |

### Frontend değişkenleri

| Değişken | Açıklama |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google ile giriş istemci kimliği |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site anahtarı |

### İsteğe bağlı servisler

| Değişkenler | Kullanım |
|---|---|
| `OPENAI_API_KEY` | Embedding, semantik arama ve ilan analizi |
| `GEMINI_API_KEY_2` | İkinci Gemini anahtarı / yedek kapasite |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase Storage işlemleri |
| `RESEND_API_KEY` | Resend üzerinden e-posta |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | SMTP e-posta alternatifi |
| `GOOGLE_CLIENT_ID` | Backend Google kimlik doğrulaması |
| `TURNSTILE_SECRET_KEY` | Turnstile sunucu doğrulaması |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | WhatsApp/Twilio entegrasyonu |
| `WHATSAPP_VERIFY_TOKEN` | WhatsApp webhook doğrulaması |
| `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL` | Iyzico ödeme altyapısı |
| `SHOPIER_API_KEY`, `SHOPIER_API_SECRET` | Shopier ödeme altyapısı |

## Veritabanı modeli

Ana tablolar:

| Tablo | Sorumluluk |
|---|---|
| `companies` | Şirket kayıtları |
| `offices` | Şirkete bağlı ofisler |
| `users` | Kullanıcı, rol ve plan bilgileri |
| `leads` | Müşteri kartları ve AI çıktıları |
| `lead_notes` | Görüşme ve sesli not geçmişi |
| `lead_events` | Durum, görev ve aktivite zaman çizelgesi |
| `properties` | Gayrimenkul portföyleri |
| `lead_property_matches` | Müşteri–portföy eşleşmeleri |
| `subscriptions` | Abonelik bilgileri |
| `crm_integrations` | Harici CRM bağlantıları |

Temel şema `server/db/schema.sql`, ek değişiklikler `server/migrations/` klasöründedir.

## API alanları

API aşağıdaki ana gruplara ayrılır:

- `/api/auth` — kayıt, giriş, Google girişi ve parola sıfırlama
- `/api/leads` — müşteri yönetimi, analiz ve müşteri notları
- `/api/voice` — ses transkripsiyonu, taslak ve onay akışı
- `/api/properties` — portföy yönetimi ve ilan analizi
- `/api/match` — semantik portföy eşleştirme
- `/api/dashboard` — günlük öncelikler ve satış brifingi
- `/api/calendar` — ajanda dışa aktarma
- `/api/stats`, `/api/analytics` — raporlama
- `/api/companies`, `/api/offices` — organizasyon yönetimi
- `/api/integrations`, `/api/whatsapp` — harici servis bağlantıları
- `/api/payment`, `/api/subscription` — ödeme ve plan yönetimi

Korunan API uçları `Authorization: Bearer <token>` başlığı bekler.

## Güvenlik ve gizlilik

- Parolalar hash’lenerek saklanır.
- Oturumlar JWT ile doğrulanır.
- API istekleri hız sınırına tabidir.
- Helmet güvenlik başlıkları kullanılır.
- CORS yalnızca izin verilen uygulama adreslerine açıktır.
- Dosya boyutları sınırlıdır.
- Sesli müşteri taslağı kullanıcı onayı olmadan CRM’e kaydedilmez.
- Hassas anahtarlar kaynak kod yerine ortam değişkenlerinde tutulmalıdır.

> Ses kayıtları transkripsiyon ve analiz için yapılandırılmış üçüncü taraf AI sağlayıcısına iletilebilir. Üretim kullanımı öncesinde KVKK aydınlatma metni, açık rıza, saklama süresi ve sağlayıcı sözleşmeleri hukuk ekibiyle doğrulanmalıdır.

## Özelliklerin çalışma koşulları

| Özellik | Gerekli yapılandırma |
|---|---|
| E-posta/parola ile giriş | PostgreSQL + JWT |
| Google ile giriş | Google OAuth client ID |
| Şifre sıfırlama e-postası | Resend veya SMTP |
| Sesli müşteri oluşturma | Gemini API |
| Semantik eşleştirme | OpenAI API + pgvector |
| İlan görsel analizi | OpenAI API |
| Görsel depolama | Supabase Storage |
| WhatsApp webhook | Twilio/WhatsApp yapılandırması |
| Bot doğrulama | Cloudflare Turnstile |
| Ödeme | Iyzico veya Shopier yapılandırması |

## Ürün prensipleri

Kapora geliştirilirken şu ilkeler korunur:

1. **Aksiyon önce gelir.** Dashboard yalnızca sayı değil, yapılacak işi göstermelidir.
2. **İnsan onayı kritiktir.** AI çıktıları kullanıcıya görünür ve düzenlenebilir olmalıdır.
3. **Mobil kullanım birincildir.** Danışman ürünü çoğunlukla sahada kullanır.
4. **Veri tek yerde yaşar.** Not, görüşme, görev ve eşleşme müşteri kartında birleşir.
5. **AI sessizce hata yapmamalıdır.** Sistem sahte veri üretmemeli; anlaşılır hata ve tekrar deneme imkânı sunmalıdır.
6. **Otomasyon ilişkiyi desteklemelidir.** Amaç danışmanın yerine geçmek değil, doğru zamanda doğru ilişkiye odaklanmasını sağlamaktır.

## Ürün yol haritası

- [x] Lead bazlı, çok adımlı ve zamanlanabilir takip planları (insan onaylı WhatsApp taslakları, hatırlatmalar ve skor güncelleme)
- E-posta/WhatsApp konuşma geçmişinin birleşik müşteri zaman çizelgesi
- Eşleşme bildirimleri ve müşteri onay akışı
- Görev tamamlama ve tekrar planlama
- Gelişmiş dönüşüm hunisi ve ekip performansı
- CRM içe/dışa aktarma araçları
- Harici ilan kaynakları ve açık entegrasyon API’si
- Otomasyon kalite ölçümleri ve AI geri bildirim sistemi

## Katkı ve geliştirme kuralları

- Secret veya gerçek müşteri verisini commit etmeyin.
- Şema değişikliklerini migration dosyasıyla ekleyin.
- Kullanıcıya gösterilen AI sonucunda hata ve boş durumlarını ele alın.
- Frontend değişikliklerinden sonra üretim build’i çalıştırın.
- Backend değişikliklerinde auth ve rol kapsamını doğrulayın.
- Yeni bir otomasyon eklerken tekrar çalıştırma ve mükerrer kayıt riskini kontrol edin.

## Lisans ve kullanım

Bu depo Kapora ürününe aittir. Lisans ve üçüncü taraf kullanım koşulları proje sahibi tarafından belirlenir. Açık bir lisans dosyası eklenmedikçe kaynak kodun yeniden dağıtım hakkı verilmiş sayılmaz.

---

**Kapora:** Müşteri verisini satış aksiyonuna dönüştüren gayrimenkul çalışma sistemi.
