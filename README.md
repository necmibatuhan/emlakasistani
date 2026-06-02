# 🏢 Emlak Asistanı - Tam Donanımlı Gayrimenkul CRM & AI

Emlak Asistanı, gayrimenkul danışmanları ve ofis yöneticileri için özel olarak geliştirilmiş **yapay zeka destekli** ve **tam donanımlı** bir CRM asistanıdır. Müşterilerden gelen WhatsApp mesajlarını analiz eder, bütçe ve aciliyet durumuna göre skorlar (Lead Scoring), sesli notlarınızı yazıya çevirerek sisteme işler ve en uygun portföylerinizi otomatik olarak eşleştirir.

Tüm sistem, "Sessiz Güç" adını verdiğimiz, Linear ve Vercel esintili, yorucu olmayan profesyonel bir karanlık tema (**Dark Mode**) ile tasarlanmıştır.

---

## 🚀 Özellikler

- **AI Lead Skorlama:** WhatsApp veya notlardan alınan müşteri mesajları anında *Sıcak, Ilık, Soğuk* olarak kategorize edilir.
- **Sesli Not Analizi:** Müşteri görüşmesinden sonra telefona konuştuğunuz 30 saniyelik özet, AI tarafından yapılandırılmış veriye dönüştürülür.
- **Portföy Eşleştirme:** Müşterinin talebiyle (bütçe, m2, konum) havuzunuzdaki portföyler saniyeler içinde otomatik eşleşir.
- **Otomatik WhatsApp Taslakları:** Müşteriye uygun portföy bulunduğunda, hazır yanıt taslağı tek tıkla kopyalanabilir.
- **Hatırlatıcı & Takip:** "Haftaya aranacak" müşteriler için sistem otomatik uyarı üretir.
- **Rol Bazlı Yönetim:** Şirket Yöneticisi (Super Admin), Ofis Yöneticisi ve Danışman olmak üzere 3 farklı yetki seviyesi ve bunlara özel modern paneller.

---

## 📂 Proje Klasör Yapısı

```text
emlak-asistani/
├── server/                   # Node.js, Express & PostgreSQL Backend
│   ├── db/                   # Veritabanı şemaları ve bağlantı dosyaları
│   ├── routes/               # API endpoint yönlendirmeleri (auth, leads, properties...)
│   └── index.js              # Sunucu başlangıç dosyası
│
└── client/                   # React, Vite & Tailwind CSS Frontend
    ├── public/               # Statik dosyalar (favicon, ikonlar)
    ├── src/
    │   ├── assets/           # Görseller ve medya (hero görseli vb.)
    │   ├── components/       # Tekrar kullanılabilir arayüz parçaları
    │   │   ├── Sidebar.jsx   # Rol bazlı akıllı sol menü
    │   │   ├── Header.jsx    # Üst navigasyon barı (Landing için)
    │   │   └── VoiceNote.jsx # Yapay zeka destekli sesli not kayıt modülü
    │   │
    │   ├── contexts/         # React Context API dosyaları
    │   │   └── AuthContext.jsx # Oturum ve rol yönetimi
    │   │
    │   ├── pages/            # Tam sayfa arayüzleri
    │   │   ├── Landing.jsx          # Açılış Sayfası (Karanlık tema, animasyonlu hero)
    │   │   ├── Auth.jsx             # Giriş / Kayıt ekranları
    │   │   ├── AgentDashboard.jsx   # Danışman Yönetim Paneli (Leadler ve Detaylar)
    │   │   ├── OfficeDashboard.jsx  # Ofis Yöneticisi Özet Paneli
    │   │   ├── CompanyDashboard.jsx # Şirket Yöneticisi (Super Admin) Özet Paneli
    │   │   ├── Properties.jsx       # Portföy Yönetimi (Satılık/Kiralık haritalandırma)
    │   │   ├── WhatsApp.jsx         # WhatsApp Entegrasyonu ve Taslak Ekranı
    │   │   ├── Profile.jsx          # Profil & Ayarlar
    │   │   ├── Plans.jsx            # Abonelik & Faturalandırma
    │   │   └── Reports.jsx          # İstatistikler ve Veri Görselleştirme
    │   │
    │   ├── App.jsx           # Uygulama ana iskeleti ve Rotalar (React Router)
    │   ├── index.css         # Global Tailwind konfigürasyonları ve animasyonlar
    │   └── main.jsx          # React uygulamasını başlatan kök dosya
    │
    ├── package.json          # Frontend bağımlılıkları (Lucide, Axios, Tailwind, vs.)
    ├── tailwind.config.js    # Tasarım sistemi ("Sessiz Güç" renk paleti)
    └── vite.config.js        # Vite derleme ayarları
```

---

## 🛠 Kurulum ve Çalıştırma

### 1. Veritabanını Başlatın (PostgreSQL)
```bash
psql -d postgres -c "CREATE DATABASE emlak_asistani;"
psql -d emlak_asistani -f server/db/schema.sql
```

### 2. Backend'i Ayağa Kaldırın
```bash
cd server
npm install
# .env dosyasını oluşturup veritabanı url'nizi ve GEMINI_API_KEY bilginizi ekleyin
npm run dev
```

### 3. Frontend'i Çalıştırın
```bash
cd client
npm install
npm run dev
```
Tarayıcınızdan `http://localhost:5173` adresine giderek uygulamayı görüntüleyebilirsiniz.

---

## 🎨 Tasarım Dili ("Sessiz Güç")
- **Ana Arka Plan:** `#0A0B0D` / `#0F1117`
- **Panel / Kart Arka Planı:** `#16181D`
- **Çerçeveler (Borders):** Çok ince ve belirsiz `#1E2025` veya `#2A2D35`
- **Vurgu (Accent):** Zarif Altın Sarısı `#F5A623` ve Zümrüt Yeşili `#10B981`
- **Font:** Geist Sans & Geist Mono
- *Kesinlikle degrade (gradient) arka planlar ve açık gri (light mode) kullanılmamıştır.* Uzun süre ekrana bakan profesyoneller için göz yormayan, güven veren mat ve ciddi bir tasarımdır.
