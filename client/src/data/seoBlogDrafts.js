const links = {
  crm: { label: 'Emlak CRM çözümünü inceleyin', to: '/emlak-crm' },
  calculator: { label: 'Emlak komisyonu hesaplama aracını kullanın', to: '/araclar/emlak-komisyonu-hesaplama' },
};

export const SEO_BLOG_DRAFTS = [
  {
    slug: 'kapora-nedir',
    title: 'Kapora Nedir? Emlak İşlemlerinde Temel Rehber',
    seoTitle: 'Kapora Nedir? Emlak İşlemleri Rehberi',
    metaDescription: 'Kapora nedir, hangi amaçla verilir ve emlak işlemlerinde nelere dikkat edilir? Editoryal inceleme bekleyen kapsamlı içerik taslağı.',
    excerpt: 'Kapora kavramını, tarafların dikkat etmesi gereken noktaları ve emlak iş akışındaki yerini açıklayan içerik taslağı.',
    summary: 'Bu taslak, kaporanın hukuki niteliğini kesin hüküm vermeden açıklar; ödeme, belge ve uyuşmazlık risklerini bir uzmanla doğrulama ihtiyacını vurgular. Kapora adlı ürün ödeme veya kapora tahsilatı yapmaz; emlak profesyonellerinin müşteri ve satış süreçlerini yönetmesine yardımcı olan bir CRM’dir.',
    outline: [
      { heading: 'Kapora ne anlama gelir?', points: ['Günlük kullanım ile hukuki kavramların ayrımı', 'Ön ödeme, bağlanma parası ve cayma parası terimleri'] },
      { heading: 'Emlak işlemlerinde kapora neden verilir?', points: ['Tarafların niyetini belgeleme', 'Taşınmazın geçici olarak rezerve edilmesi beklentisi'] },
      { heading: 'Kapora verirken hangi bilgiler yazılmalı?', points: ['Taraf, taşınmaz, tutar ve tarih bilgileri', 'İade ve cayma koşullarının açık yazılması'] },
      { heading: 'Sık yapılan hatalar nelerdir?', points: ['Belgesiz ödeme yapmak', 'Yetki ve tapu bilgilerini doğrulamamak'] },
      { heading: 'Süreç CRM ile nasıl takip edilir?', points: ['Görüşme ve belge adımlarını kaydetmek', 'Ödeme almadan satış sürecini görünür kılmak'] },
    ],
    faq: [
      { question: 'Kapora ürünü müşteriden ödeme alır mı?', answer: 'Hayır. Kapora bir emlak CRM ürünüdür; kapora veya başka bir ödeme tahsil etmez.' },
      { question: 'Kapora her durumda iade edilir mi?', answer: 'İade koşulları sözleşmenin içeriğine ve olayın niteliğine göre değişebilir. Somut işlem için hukuk uzmanına danışılmalıdır.' },
    ],
    relatedLinks: [links.crm], targetKeyword: 'kapora nedir', searchVolume: 8100, priority: 1, date: '2026-08-30', readTime: '8 dk', category: 'Emlak Rehberi', status: 'draft'
  },
  {
    slug: 'kapora-sozlesmesi', title: 'Kapora Sözleşmesi Nasıl Hazırlanır?', seoTitle: 'Kapora Sözleşmesi Nasıl Hazırlanır?',
    metaDescription: 'Kapora sözleşmesinde bulunması gereken temel bilgiler, riskler ve kontrol listesi için editoryal içerik taslağını inceleyin.',
    excerpt: 'Kapora sözleşmesinde taraf, taşınmaz, tutar ve koşulların nasıl açıklaştırılacağını ele alan taslak.',
    summary: 'Bu içerik bir sözleşme örneği veya hukuki danışmanlık sunmaz; güvenli bir editoryal çerçeve ve kontrol listesi sağlar. Kapora CRM ödeme almaz ve sözleşmenin tarafı değildir.',
    outline: [
      { heading: 'Kapora sözleşmesinin amacı nedir?', points: ['Beklentileri yazılı hale getirmek', 'İşlemin kapsamını ve koşullarını netleştirmek'] },
      { heading: 'Sözleşmede hangi bilgiler bulunmalı?', points: ['Taraf ve taşınmaz bilgileri', 'Tutar, ödeme yöntemi, süre ve koşullar'] },
      { heading: 'İade ve cayma koşulları nasıl yazılmalı?', points: ['Belirsiz ifadelerden kaçınmak', 'Uzman incelemesi gerektiren hükümler'] },
      { heading: 'İmza öncesi kontrol listesi', points: ['Yetki, kimlik ve tapu kontrolleri', 'Dekont ve nüsha saklama'] },
    ], faq: [{ question: 'Bu sayfa hukuki sözleşme örneği mi?', answer: 'Hayır. İçerik genel bilgilendirme taslağıdır; işlem özelinde hukuk uzmanına danışılmalıdır.' }],
    relatedLinks: [links.crm], targetKeyword: 'kapora sözleşmesi', searchVolume: 390, priority: 2, date: '2026-08-30', readTime: '7 dk', category: 'Emlak Rehberi', status: 'draft'
  },
  {
    slug: 'kapora-iadesi', title: 'Kapora İadesi: Hangi Durumlar Değerlendirilir?', seoTitle: 'Kapora İadesi: Bilmeniz Gerekenler',
    metaDescription: 'Kapora iadesinde sözleşme, cayma koşulları ve belgelerin rolünü açıklayan; hukuki inceleme bekleyen tarafsız içerik taslağı.',
    excerpt: 'Kapora iadesinin neden tek bir cevabı olmadığını ve hangi belgelerin değerlendirilmesi gerektiğini anlatan taslak.',
    summary: 'İadenin mümkün olup olmadığı; ödeme amacı, sözleşme metni, tarafların davranışı ve somut olaya göre değişebilir. Bu taslak kesin hukuki sonuç üretmez.',
    outline: [
      { heading: 'Kapora iadesini hangi unsurlar etkiler?', points: ['Ödemenin niteliği', 'Yazılı koşullar ve tarafların yükümlülükleri'] },
      { heading: 'Alıcı veya satıcı vazgeçerse ne olur?', points: ['Farklı senaryoların ayrı değerlendirilmesi', 'Kesin sonuç yerine belge temelli inceleme'] },
      { heading: 'Uyuşmazlıkta hangi belgeler önemlidir?', points: ['Sözleşme, dekont ve yazışmalar', 'Yetki ve taşınmaz kayıtları'] },
      { heading: 'Profesyonel destek ne zaman alınmalı?', points: ['Uyuşmazlık doğmadan önleyici inceleme', 'Arabuluculuk ve hukuki danışmanlık seçenekleri'] },
    ], faq: [{ question: 'Kapora otomatik olarak yanar mı?', answer: 'Hayır, böyle genel bir sonuç kurulamaz. Ödemenin niteliği ve sözleşme koşulları somut olayla birlikte değerlendirilmelidir.' }],
    relatedLinks: [links.crm], targetKeyword: 'kapora iadesi', searchVolume: 170, priority: 3, date: '2026-08-30', readTime: '6 dk', category: 'Emlak Rehberi', status: 'draft'
  },
  {
    slug: 'kapora-ne-kadar-verilir', title: 'Kapora Ne Kadar Verilir? Tutar Nasıl Belirlenir?', seoTitle: 'Kapora Ne Kadar Verilir?',
    metaDescription: 'Kapora tutarının belirlenmesinde işlem değeri, risk ve yazılı koşulların rolünü anlatan editoryal içerik taslağı.',
    excerpt: 'Sabit bir oran iddiası yerine, kapora tutarının taraflar ve işlem koşullarıyla nasıl değerlendirilmesini gerektiğini ele alır.',
    summary: 'Her işlem için geçerli tek bir kapora oranı varmış gibi sunmak yanıltıcı olabilir. Tutar, koşullar ve ödeme amacı açıkça belgelenmelidir; Kapora CRM tahsilat yapmaz.',
    outline: [
      { heading: 'Kapora için sabit bir oran var mı?', points: ['Piyasa alışkanlığı ile hukuki zorunluluğu ayırmak', 'Somut işlem koşullarının önemi'] },
      { heading: 'Tutar belirlenirken nelere bakılır?', points: ['Taşınmaz değeri ve işlem takvimi', 'Tarafların riski ve yazılı mutabakatı'] },
      { heading: 'Ödeme öncesi güvenlik kontrolü', points: ['Yetki ve taşınmaz doğrulaması', 'Açıklamalı dekont ve yazılı belge'] },
      { heading: 'Danışman süreci nasıl kayıt altına alır?', points: ['Müşteri adımları ve hatırlatmalar', 'Ödeme tahsil etmeden süreç yönetimi'] },
    ], faq: [{ question: 'Kapora için yasal tek bir yüzde var mı?', answer: 'Her işlem için geçerli tek bir oran varsayılmamalıdır. Tutar ve koşullar somut işlem özelinde yazılı olarak belirlenmelidir.' }],
    relatedLinks: [links.crm], targetKeyword: 'kapora ne kadar verilir', searchVolume: 140, priority: 3, date: '2026-08-30', readTime: '5 dk', category: 'Emlak Rehberi', status: 'draft'
  },
  {
    slug: 'emlakci-nasil-olunur-2026', title: 'Emlakçı Nasıl Olunur? 2026 Yol Haritası', seoTitle: 'Emlakçı Nasıl Olunur? 2026 Rehberi',
    metaDescription: '2026 yılında emlakçı olma adımları, yetkinlikler, belge süreci ve iş modeli seçenekleri için güncel içerik taslağı.', excerpt: 'Mesleğe girişten müşteri portföyü oluşturmaya uzanan uygulanabilir yol haritası.',
    summary: 'Mesleğe giriş seçeneklerini, resmi gereklilikleri doğrulama adımlarını ve ilk müşteri sisteminin nasıl kurulacağını ele alan taslak.',
    outline: [{ heading: 'Emlakçılık mesleği kimler için uygun?', points: ['Temel yetkinlikler', 'Gelir modelinin gerçekleri'] }, { heading: '2026 resmi gereklilikleri nelerdir?', points: ['Eğitim ve yeterlilik başlıkları', 'Güncel mevzuatı resmi kaynaktan doğrulama'] }, { heading: 'Ofiste mi bağımsız mı başlanmalı?', points: ['Risk ve destek karşılaştırması', 'Başlangıç bütçesi'] }, { heading: 'İlk 90 günde ne yapılmalı?', points: ['Bölge uzmanlığı', 'CRM ve takip rutini'] }],
    relatedLinks: [links.crm], targetKeyword: 'emlakçı nasıl olunur', priority: 1, date: '2026-08-30', readTime: '8 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'gayrimenkul-danismani-nedir-ne-is-yapar', title: 'Gayrimenkul Danışmanı Nedir, Ne İş Yapar?', seoTitle: 'Gayrimenkul Danışmanı Nedir, Ne İş Yapar?',
    metaDescription: 'Gayrimenkul danışmanının görevleri, sorumlulukları, çalışma düzeni ve başarı ölçütleri için kapsamlı içerik taslağı.', excerpt: 'Bir gayrimenkul danışmanının günlük işini ve müşteriye sağladığı değeri açıklar.', summary: 'Rolü yalnızca ilan girmekten ayırır; portföy, müşteri, pazarlama, gösterim, müzakere ve takip sorumluluklarını haritalar.',
    outline: [{ heading: 'Gayrimenkul danışmanı kimdir?', points: ['Rolün kapsamı', 'Emlakçı ve danışman terimleri'] }, { heading: 'Günlük görevleri nelerdir?', points: ['Portföy ve müşteri kazanımı', 'Gösterim, müzakere ve takip'] }, { heading: 'Hangi beceriler gerekir?', points: ['İletişim ve bölge bilgisi', 'Dijital araç kullanımı'] }, { heading: 'Başarı nasıl ölçülür?', points: ['Dönüşüm ve takip göstergeleri', 'Müşteri memnuniyeti'] }],
    relatedLinks: [links.crm], targetKeyword: 'gayrimenkul danışmanı nedir', priority: 1, date: '2026-08-30', readTime: '7 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'emlak-burosu-nasil-acilir', title: 'Emlak Bürosu Nasıl Açılır? Başlangıç Rehberi', seoTitle: 'Emlak Bürosu Nasıl Açılır?',
    metaDescription: 'Emlak bürosu açma planı; iş modeli, resmi işlemler, bütçe, ekip, teknoloji ve ilk 90 gün başlıklarıyla içerik taslağı.', excerpt: 'Ofis açılışını resmi süreç, bütçe, ekip ve teknoloji boyutlarıyla planlayan taslak.', summary: 'Resmi gerekliliklerin güncel kaynaktan doğrulanmasını öneren, yatırım kararını adımlara bölen başlangıç çerçevesi.',
    outline: [{ heading: 'İş modeli ve bölge nasıl seçilir?', points: ['Hedef segment', 'Rakip ve talep analizi'] }, { heading: 'Resmi süreçte neler kontrol edilir?', points: ['Şirket ve oda işlemleri', 'Yetki belgesi koşulları'] }, { heading: 'Başlangıç bütçesi nasıl hazırlanır?', points: ['Sabit ve değişken giderler', 'Nakit akışı tamponu'] }, { heading: 'Ofis operasyonu nasıl kurulur?', points: ['Rol ve süreçler', 'CRM, raporlama ve veri güvenliği'] }], relatedLinks: [links.crm], targetKeyword: 'emlak bürosu nasıl açılır', priority: 2, date: '2026-08-30', readTime: '9 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'gayrimenkul-danismanligi-nasil-olunur', title: 'Gayrimenkul Danışmanlığı Nasıl Olunur?', seoTitle: 'Gayrimenkul Danışmanlığı Nasıl Olunur?',
    metaDescription: 'Gayrimenkul danışmanlığına başlama, eğitim, uzmanlık bölgesi, müşteri kazanımı ve çalışma sistemi için içerik taslağı.', excerpt: 'Danışmanlığa giriş için yetkinlik, öğrenme ve müşteri sistemi odaklı yol haritası.', summary: 'Kariyer değişikliği yapanlar için gerçekçi beklentiler, ilk eğitim planı ve ölçülebilir çalışma rutini sunar.',
    outline: [{ heading: 'Başlangıç koşulları nelerdir?', points: ['Kişisel uygunluk', 'Resmi gereklilikleri doğrulama'] }, { heading: 'Hangi eğitimler alınmalı?', points: ['Mevzuat ve satış bilgisi', 'Bölge uzmanlığı'] }, { heading: 'İlk müşteriler nasıl bulunur?', points: ['Çevre ve saha çalışması', 'Dijital görünürlük'] }, { heading: 'Takip sistemi nasıl kurulur?', points: ['Günlük aktivite hedefleri', 'CRM ve pipeline'] }], relatedLinks: [links.crm], targetKeyword: 'gayrimenkul danışmanlığı nasıl olunur', priority: 2, date: '2026-08-30', readTime: '7 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'emlakcilik-nasil-yapilir', title: 'Emlakçılık Nasıl Yapılır? Uygulamalı Başlangıç', seoTitle: 'Emlakçılık Nasıl Yapılır?',
    metaDescription: 'Portföy bulma, müşteri yönetimi, ilan, gösterim, müzakere ve satış sonrası takip adımlarıyla emlakçılık içerik taslağı.', excerpt: 'Emlakçılığın uçtan uca iş akışını günlük uygulamalarla anlatan içerik planı.', summary: 'İlk temastan satış sonrasına kadar tekrarlanabilir bir danışmanlık sistemi kurmayı hedefler.',
    outline: [{ heading: 'Bölge ve müşteri odağı nasıl seçilir?', points: ['Uzmanlık alanı', 'Talep haritası'] }, { heading: 'Portföy nasıl kazanılır?', points: ['Mülk sahibi görüşmesi', 'Yetkilendirme ve veri kalitesi'] }, { heading: 'Müşteri süreci nasıl yönetilir?', points: ['İhtiyaç analizi ve eşleştirme', 'Gösterim ve geri bildirim'] }, { heading: 'Satış sonrası ne yapılır?', points: ['Referans isteme', 'İlişkiyi CRM’de sürdürme'] }], relatedLinks: [links.crm], targetKeyword: 'emlakçılık nasıl yapılır', priority: 2, date: '2026-08-30', readTime: '8 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'gayrimenkul-danismani-ne-is-yapar', title: 'Gayrimenkul Danışmanı Ne İş Yapar?', seoTitle: 'Gayrimenkul Danışmanı Ne İş Yapar?',
    metaDescription: 'Gayrimenkul danışmanının portföy, müşteri, pazarlama, gösterim, müzakere ve raporlama görevlerini keşfedin.', excerpt: 'Danışmanın günlük, haftalık ve işlem bazlı sorumluluklarını ayrıştıran içerik taslağı.', summary: 'Arama niyetine hızlı yanıt verir; rolün günlük çıktıları ile uzun vadeli ilişki yönetimini ayrı başlıklarda anlatır.',
    outline: [{ heading: 'Gün içinde hangi işleri yapar?', points: ['Arama, görüşme ve saha planı', 'İlan ve portföy güncelleme'] }, { heading: 'Müşteri için hangi değeri üretir?', points: ['İhtiyaç analizi', 'Alternatifleri kıyaslama'] }, { heading: 'Mülk sahibi için ne yapar?', points: ['Konumlandırma ve pazarlama', 'Geri bildirim raporu'] }, { heading: 'İşini hangi araçlarla yönetir?', points: ['CRM ve takvim', 'Raporlama ve otomasyon'] }], relatedLinks: [links.crm], targetKeyword: 'gayrimenkul danışmanı ne iş yapar', priority: 1, date: '2026-08-30', readTime: '6 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'emlak-danismani-maaslari-2026', title: 'Emlak Danışmanı Maaşları 2026: Gelir Modeli', seoTitle: 'Emlak Danışmanı Maaşları 2026',
    metaDescription: 'Emlak danışmanı maaşları 2026 araştırması için sabit maaş, prim, komisyon, gider ve gelir senaryolarını açıklayan taslak.', excerpt: 'Tek bir maaş rakamı yerine farklı çalışma ve komisyon modellerini karşılaştırır.', summary: 'Güncel piyasa verileri eklenmeden yayımlanmaması gereken; brüt gelir, gider ve tahsilat zamanını ayrı değerlendiren taslak.',
    outline: [{ heading: 'Danışmanlar nasıl gelir elde eder?', points: ['Maaş, prim ve komisyon modelleri', 'Ofis payı ve giderler'] }, { heading: '2026 gelirini hangi değişkenler etkiler?', points: ['Bölge ve işlem adedi', 'Portföy kalitesi ve dönüşüm'] }, { heading: 'Net kazanç nasıl hesaplanır?', points: ['Vergi ve operasyon giderleri', 'Tahsilat zamanı'] }, { heading: 'Gelir nasıl daha öngörülebilir olur?', points: ['Pipeline takibi', 'Aktivite ve dönüşüm hedefleri'] }], relatedLinks: [links.crm, links.calculator], targetKeyword: 'emlak danışmanı maaşları 2026', priority: 2, date: '2026-08-30', readTime: '7 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'emlak-danismanligi-bagimsiz-mi-ofis-mi', title: 'Emlak Danışmanlığı: Bağımsız mı, Ofis mi?', seoTitle: 'Emlak Danışmanlığı: Bağımsız mı, Ofis mi?',
    metaDescription: 'Bağımsız çalışmak ile emlak ofisine katılmayı maliyet, destek, marka, eğitim, teknoloji ve gelir açısından karşılaştırın.', excerpt: 'İki çalışma modelini karar kriterleri ve riskleriyle kıyaslayan içerik taslağı.', summary: 'Tek bir doğru önermek yerine deneyim, sermaye, destek ihtiyacı ve büyüme hedeflerine göre karar matrisi kurar.',
    outline: [{ heading: 'Bağımsız çalışmanın artıları ve riskleri', points: ['Kontrol ve maliyet', 'Marka ve destek açığı'] }, { heading: 'Ofise katılmanın artıları ve riskleri', points: ['Eğitim, marka ve paylaşım', 'Komisyon modeli ve kurallar'] }, { heading: 'Karar verirken ne sorulmalı?', points: ['Teknoloji ve lead desteği', 'Sözleşme ve hedefler'] }, { heading: 'Her iki modelde sistem nasıl kurulur?', points: ['Kişisel veri disiplini', 'CRM ile taşınabilir iş düzeni'] }], relatedLinks: [links.crm], targetKeyword: 'emlak danışmanlığı bağımsız ofis', priority: 3, date: '2026-08-30', readTime: '7 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'en-iyi-emlak-markalari-franchise', title: 'En İyi Emlak Markaları ve Franchise Seçimi', seoTitle: 'En İyi Emlak Markaları ve Franchise Seçimi',
    metaDescription: 'Emlak franchise seçimini marka sıralaması yerine eğitim, teknoloji, ücret, bölge koruması ve destek ölçütleriyle değerlendirin.', excerpt: '“En iyi” iddiasını ölçülebilir seçim kriterlerine dönüştüren tarafsız içerik taslağı.', summary: 'Doğrulanmamış sıralama yapmaz; adayların güncel sözleşme ve maliyetleri doğrudan markalardan teyit etmesini ister.',
    outline: [{ heading: 'En iyi marka nasıl tanımlanır?', points: ['Hedef ve bölge uyumu', 'Ölçülebilir destek kriterleri'] }, { heading: 'Franchise maliyetinde neler incelenir?', points: ['Giriş ve sürekli ücretler', 'Pazarlama ve teknoloji giderleri'] }, { heading: 'Eğitim ve operasyon desteği nasıl ölçülür?', points: ['Başlangıç ve sürekli eğitim', 'Lead, CRM ve raporlama altyapısı'] }, { heading: 'Sözleşme öncesi sorulacak sorular', points: ['Bölge koruması ve çıkış koşulları', 'Mevcut franchise sahipleriyle görüşme'] }], relatedLinks: [links.crm], targetKeyword: 'en iyi emlak markaları', priority: 3, date: '2026-08-30', readTime: '9 dk', category: 'Emlak Kariyeri', status: 'draft'
  },
  {
    slug: 'eids-nedir', title: 'EİDS Nedir? Emlak İlanlarında Yetki Doğrulama', seoTitle: 'EİDS Nedir? Yetki Doğrulama Rehberi',
    metaDescription: 'EİDS nedir, emlak ilanlarında kimlik ve yetki doğrulama nasıl işler? Resmî kaynaklara dayalı editoryal içerik taslağı.', excerpt: 'Elektronik İlan Doğrulama Sistemi’nin amaç ve işleyişini özetleyen güncel taslak.', summary: 'EİDS’nin elektronik ilanlarda kimlik ve yetki doğrulama amacını, danışman ve taşınmaz sahibi açısından hazırlık adımlarını resmî kaynaklarla çerçeveler.',
    outline: [{ heading: 'EİDS nedir ve neden kuruldu?', points: ['Kimlik ve yetki doğrulama amacı', 'İlan güvenilirliği'] }, { heading: 'Yetki doğrulama kimleri etkiler?', points: ['Taşınmaz sahibi ve yakınları', 'Yetki belgeli emlak işletmeleri'] }, { heading: 'E-Devlet üzerinden yetkilendirme nasıl işler?', points: ['Taşınmaz seçimi ve işletme yetkisi', 'Süre ve iptal kontrolleri'] }, { heading: 'Danışmanlar nasıl hazırlanmalı?', points: ['Yetki belgesi ve ilan süreçleri', 'Müşteri bilgilendirme kontrol listesi'] }],
    sourceNotes: [{ label: 'Ticaret Bakanlığı EİDS', href: 'https://eids.ticaret.gov.tr/' }, { label: 'Ticaret Bakanlığı duyurusu', href: 'https://icticaret.ticaret.gov.tr/haberler/elektronik-ilan-dogrulama-sistemi-eids-yetki-dogrulama-uygulamasi-hayata-gecirildi' }],
    faq: [{ question: 'EİDS neyi doğrular?', answer: 'Ticaret Bakanlığına göre sistem elektronik ilanlarda kimlik ve ilan verme yetkisinin doğrulanmasına hizmet eder.' }], relatedLinks: [links.crm], targetKeyword: 'eids nedir', priority: 1, date: '2026-08-30', readTime: '7 dk', category: 'Mevzuat', status: 'draft'
  },
  {
    slug: 'emlak-yetki-belgesi-nasil-alinir', title: 'Emlak Yetki Belgesi Nasıl Alınır?', seoTitle: 'Emlak Yetki Belgesi Nasıl Alınır?',
    metaDescription: 'Taşınmaz ticareti yetki belgesi başvurusu, temel koşullar ve resmî doğrulama adımları için güncel içerik taslağı.', excerpt: 'Başvuru sürecini ve güncel koşulların resmî kanallardan nasıl doğrulanacağını anlatır.', summary: 'Koşulların işletme ve başvuru sahibine göre değişebileceğini belirterek TTBS ve Ticaret Bakanlığı kaynaklarına yönlendirir.',
    outline: [{ heading: 'Yetki belgesi nedir?', points: ['Belgenin kapsamı', 'İşletme ve danışman ayrımı'] }, { heading: 'Başvuru öncesi hangi koşullar kontrol edilir?', points: ['Mesleki yeterlilik ve eğitim', 'Vergi, oda ve iş yeri kayıtları'] }, { heading: 'Başvuru nereden yapılır?', points: ['TTBS başvuru akışı', 'Belge ve bilgi hazırlığı'] }, { heading: 'Belge sonrası sorumluluklar nelerdir?', points: ['Güncellik ve ilan süreçleri', 'Mevzuat değişikliklerini takip'] }],
    sourceNotes: [{ label: 'Ticaret Bakanlığı sektör SSS', href: 'https://ticaret.gov.tr/ic-ticaret/sikca-sorulan-sorular/sektorel-ticaret' }, { label: 'Taşınmaz Ticareti Bilgi Sistemi', href: 'https://ttbs.gtb.gov.tr/' }], relatedLinks: [links.crm], targetKeyword: 'emlak yetki belgesi', priority: 1, date: '2026-08-30', readTime: '8 dk', category: 'Mevzuat', status: 'draft'
  },
  {
    slug: 'emlak-komisyonu-ne-kadar-2026', title: 'Emlak Komisyonu Ne Kadar? 2026 Rehberi', seoTitle: 'Emlak Komisyonu Ne Kadar? 2026',
    metaDescription: '2026 emlak komisyonu üst sınırları, KDV, satış ve kiralamada paylaşım esasları için resmî kaynaklı içerik taslağı.', excerpt: 'Satış ve kiralama hizmet bedelini, KDV’yi ve paylaşım seçeneklerini ayrı ayrı ele alır.', summary: 'Taslak, yürürlükteki düzenlemede satış aracılık hizmet bedelinin KDV hariç toplam satış bedelinin yüzde 4’ünü; kiralamada ise KDV hariç bir aylık kira bedelini aşamayacağı çerçevesini resmî kaynaktan doğrulatır.',
    outline: [{ heading: 'Satışta emlak komisyonu üst sınırı nedir?', points: ['Toplam hizmet bedeli', 'KDV’nin ayrı değerlendirilmesi'] }, { heading: 'Kiralamada hizmet bedeli nasıl hesaplanır?', points: ['Bir aylık kira sınırı', 'KDV ve sözleşme'] }, { heading: 'Komisyonu kim öder?', points: ['Aksi kararlaştırılmadıkça paylaşım', 'Yazılı anlaşmanın önemi'] }, { heading: 'Örnek hesaplamalar', points: ['Satış senaryosu', 'Kiralama senaryosu ve hesaplama aracı'] }],
    sourceNotes: [{ label: 'Ticaret Bakanlığı taşınmaz ticareti bilgisi', href: 'https://antalya.ticaret.gov.tr/basvurular/tasinmaz-ticareti-yetki-belgesi-verilmesi' }], faq: [{ question: 'Satışta hizmet bedeli üst sınırı nedir?', answer: 'Resmî düzenleme bilgisinde toplam hizmet bedeli, KDV hariç satış bedelinin yüzde 4’ünü aşamaz.' }, { question: 'Kiralamada üst sınır nedir?', answer: 'Resmî düzenleme bilgisinde kiralama hizmet bedeli, KDV hariç bir aylık kira tutarını aşamaz.' }], relatedLinks: [links.calculator, links.crm], targetKeyword: 'emlak komisyonu ne kadar 2026', priority: 1, date: '2026-08-30', readTime: '7 dk', category: 'Mevzuat', status: 'draft'
  }
];

