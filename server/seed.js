const db = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Seeding veritabanı temizleniyor...');
    await db.query('DELETE FROM lead_property_matches');
    await db.query('DELETE FROM leads');
    await db.query('DELETE FROM properties');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM offices');
    await db.query('DELETE FROM companies');

    console.log('Genişletilmiş ve GERÇEKÇİ demo verileri ekleniyor...');

    // 1. Şirket
    const companyRes = await db.query(
      "INSERT INTO companies (name, plan) VALUES ($1, $2) RETURNING id",
      ['Global Emlak A.Ş.', 'enterprise']
    );
    const companyId = companyRes.rows[0].id;

    // 2. Ofisler
    const office1Res = await db.query(
      "INSERT INTO offices (company_id, name, city, region) VALUES ($1, $2, $3, $4) RETURNING id",
      [companyId, 'Merkez Ofis', 'İstanbul', 'Kadıköy']
    );
    const office1Id = office1Res.rows[0].id;

    const office2Res = await db.query(
      "INSERT INTO offices (company_id, name, city, region) VALUES ($1, $2, $3, $4) RETURNING id",
      [companyId, 'Avrupa Yakası Şube', 'İstanbul', 'Beşiktaş']
    );
    const office2Id = office2Res.rows[0].id;

    const office3Res = await db.query(
      "INSERT INTO offices (company_id, name, city, region) VALUES ($1, $2, $3, $4) RETURNING id",
      [companyId, 'Başkent Şube', 'Ankara', 'Çankaya']
    );
    const office3Id = office3Res.rows[0].id;

    // 3. Kullanıcılar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    await db.query(
      "INSERT INTO users (company_id, office_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [companyId, office1Id, 'Ahmet Patron (Admin)', 'admin@c21.com', hashedPassword, 'company_admin']
    );

    await db.query(
      "INSERT INTO users (company_id, office_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [companyId, office1Id, 'Ayşe Müdür (Manager)', 'manager@c21.com', hashedPassword, 'office_manager']
    );

    const agentRes = await db.query(
      "INSERT INTO users (company_id, office_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [companyId, office1Id, 'Mehmet Danışman (Agent)', 'agent@c21.com', hashedPassword, 'agent']
    );
    const agent1Id = agentRes.rows[0].id;

    const agent2Res = await db.query(
      "INSERT INTO users (company_id, office_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [companyId, office1Id, 'Fatma Danışman (Agent)', 'agent2@c21.com', hashedPassword, 'agent']
    );
    const agent2Id = agent2Res.rows[0].id;

    // 4. Mülkler
    const props = [
      [office1Id, 'Kadıköy Merkezde 3+1 Lüks Daire', 'Satılık', 'Konut', 'İstanbul', 'Kadıköy', 8500000, '3+1', 120],
      [office1Id, 'Fenerbahçe Sahilde Yalı Dairesi', 'Satılık', 'Konut', 'İstanbul', 'Kadıköy', 25000000, '4+1', 200],
      [office1Id, 'Moda Deniz Manzaralı Kiralık', 'Kiralık', 'Konut', 'İstanbul', 'Kadıköy', 45000, '2+1', 95],
      [office2Id, 'Beşiktaş Çarşı İçi Dükkan', 'Kiralık', 'İşyeri', 'İstanbul', 'Beşiktaş', 65000, 'Tek Bölüm', 80],
    ];

    for (let p of props) {
      await db.query(
        "INSERT INTO properties (company_id, office_id, title, type, category, city, district, price, rooms, sqm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [companyId, p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8]]
      );
    }

    // 5. Gerçekçi Leadler
    const leads = [
      [
        office1Id, agent1Id, 'Caner Yılmaz', '+905321112233', 'Sıcak', 9, 'Randevu Alındı', 'WhatsApp',
        "Müşteri evli ve 2 çocuk babası. Çocukların okulları Moda'da olduğu için kesinlikle Moda veya Fenerbahçe civarında 3+1 ev arıyor. Bütçesi 10 Milyon TL'ye kadar çıkabiliyor. Krediye uygun olması şart. Eşi mimar olduğu için içi yapılı evleri tercih ediyor. Hafta sonu evleri gezmek için müsaitler.",
        "Merhaba Caner Bey, Takip.ai'dan Mehmet ben. WhatsApp üzerinden Moda ve Fenerbahçe civarında 3+1 ev arayışınız olduğunu belirtmiştiniz. Portföyümüze tam tarif ettiğiniz gibi, çocukların okullarına çok yakın ve içi tamamen yenilenmiş harika bir daire eklendi. Üstelik krediye de uygun. Eşinizle birlikte hafta sonu bu evi görmek ister misiniz? Müsaitlik durumunuzu paylaşırsanız hemen randevu oluşturabilirim. İyi günler dilerim."
      ],
      [
        office1Id, agent1Id, 'Elif Hanım', '+905445556677', 'Ilık', 6, 'Arandı', 'Instagram',
        "Instagram reklamından form doldurdu. Yatırım amaçlı Kadıköy çevresinde kiralama getirisi yüksek 1+1 veya 2+1 ev arıyor. Nakit alım yapacak, bütçe: 4.5 - 5 Milyon TL. Hemen kiracı bulabileceği amortisman süresi kısa yerler istiyor.",
        "Elif Hanım merhabalar, Global Emlak'tan ulaşıyorum. Instagram üzerinden yatırım amaçlı Kadıköy bölgesinde ev arayışınız için bize ulaşmışsınız. Nakit alım yapacağınızı not aldım. Şu an elimde, amortisman süresi sadece 12 yıl olan ve hemen kiraya verebileceğimiz çok merkezi iki adet 1+1 daire bulunuyor. İsterseniz detaylı sunumlarını ve kira getiri analizlerini PDF olarak iletebilirim. Ne dersiniz?"
      ],
      [
        office1Id, agent1Id, 'Burak Kaya', '+905058889900', 'Soğuk', 3, 'Takipte', 'Sahibinden',
        "Sahibinden.com üzerinden mesaj attı. Kendi evini satıp yerine daha büyük bir ev almak istiyor ama henüz fiyatlar konusunda piyasayı araştırma aşamasında. Çok acelesi yok, seneye taşınmayı planlıyor.",
        "Merhabalar Burak Bey, ilanımız üzerinden bize ulaştığınız için teşekkürler. Kendi evinizi satıp daha büyük bir mülke geçme düşünceniz olduğunu görüyorum. İsterseniz öncelikle mevcut eviniz için ücretsiz bir 'Güncel Piyasa Değerleme Analizi' yapabiliriz. Böylece elinize geçecek net bütçeyi görerek, alacağınız evi çok daha rahat seçebilirsiniz. İlgilenirseniz kahve içmeye ofisimize bekleriz."
      ],
      [
        office1Id, agent2Id, 'Zeynep Akın', '+905554443322', 'Sıcak', 8, 'Takipte', 'Web',
        "Web sitemizdeki Fenerbahçe Yalı dairesi ilanını incelemiş ve form bırakmış. Yurt dışında (Almanya) yaşıyor, yazları kullanmak üzere deniz manzaralı lüks bir daire arıyor. Bütçesi esnek, Euro ile ödeme yapacak. Önümüzdeki hafta Türkiye'ye gelecek.",
        "Merhaba Zeynep Hanım, Global Emlak'tan Fatma ben. Web sitemiz üzerinden Fenerbahçe'deki yalı dairemizle ilgilendiğinizi gördüm. Almanya'dan önümüzdeki hafta geleceğinizi not aldık. Bu dairemiz tam olarak yaz aylarında keyifle vakit geçirebileceğiniz, kesintisiz deniz manzarasına sahip çok özel bir mülktür. Türkiye'ye geliş takviminizi netleştirdiğinizde haber verirseniz, ilk ziyareti size rezerve edebiliriz. Uçuşunuzda iyi yolculuklar dilerim."
      ],
      // YENİ EKLENEN GEÇMİŞ GÖRÜŞMELİ LEADLER
      [
        office1Id, agent1Id, 'Kemal Sunay', '+905337778899', 'Sıcak', 9, 'Sözleşme Aşamasında', 'Referans',
        "GEÇMİŞ GÖRÜŞME NOTLARI: Kemal Bey ile geçen hafta 3 farklı portföy gezdik. Fenerbahçe'deki 25 Milyon TL'lik Yalı Dairesini çok beğendi. Fiyat konusunda 23 Milyona düşmemizi teklif etti, mal sahibiyle görüştüm ve 23.5 Milyon TL'ye anlaştık. Şu an kapora yatırması bekleniyor. \n\nÖNEMLİ NOT: Kemal Bey'in avukatı salı günü sözleşme taslağını inceleyecek. Tapu masraflarının yarı yarıya olmasını istiyorlar.",
        "Kemal Bey merhabalar, umarım harika bir hafta sonu geçiriyorsunuzdur. Mal sahibi ile son tapu harcı masrafları konusunda da anlaştık, masraflar yarı yarıya ödenecek. Salı günü avukatınızın incelemesi için sözleşme taslağını hazırladım ve e-postanıza gönderdim. Avukatınız inceledikten sonra bana dönüş yaparsanız perşembe günü için tapu randevumuzu alabilirim. Görüşmek üzere."
      ],
      [
        office1Id, agent1Id, 'Aylin Çelik', '+905552221100', 'Ilık', 7, 'Takipte', 'Telefon',
        "GEÇMİŞ GÖRÜŞME NOTLARI: Aylin Hanım geçen ay ofisimize uğradı. Kozyatağı veya Bostancı'da metroya yürüme mesafesinde 2+1 arıyor. O gün elimizdeki 2 portföyü gösterdik ama ikisinin de salonunu küçük buldu. \n\nNOT: Özellikle geniş mutfaklı ve ebeveyn banyolu bir yer çıkarsa hemen haber verilmesini istedi. Bütçe maksimum 7 Milyon TL.",
        "Aylin Hanım merhaba, Mehmet ben. Geçen ay ofisimizi ziyaretinizde geniş salonlu ve metroya yakın bir 2+1 aradığınızı konuşmuştuk. Tam da istediğiniz gibi, Bostancı metroya sadece 3 dakika yürüme mesafesinde, geniş Amerikan mutfaklı yeni bir portföy aldık. Üstelik tam bütçenize uygun. Fotoğraflarını WhatsApp üzerinden iletiyorum, inceledikten sonra evi görmek isterseniz yarın öğleden sonra size gösterebilirim."
      ],
      [
        office1Id, agent1Id, 'Hasan Demir', '+905443339911', 'Soğuk', 4, 'Takipte', 'Sahibinden',
        "GEÇMİŞ GÖRÜŞME NOTLARI: 2 ay önce Göztepe'deki daireyi göstermiştik. Evi çok beğendi ama kredi faiz oranlarının yüksek olmasından dolayı alımı ertelediğini söyledi. Nakdi sadece 3 Milyon TL var, geri kalanını kredi çekecekti. \n\nNOT: Ara ara faiz indirimleri olursa veya acil uygun fiyatlı bir yer düşerse diye takip listesinde tutuyorum.",
        "Hasan Bey merhabalar, umarım keyfiniz yerindedir. Kredi faizleri sebebiyle ev alımınızı ertelediğinizi konuşmuştuk. Şu sıralar bankaların konut kredilerinde dönemsel küçük indirim kampanyaları başladı. Ayrıca elimize nakit ihtiyacından dolayı acil satılık ve piyasanın yaklaşık %15 altında bir Göztepe dairesi geldi. Bu fırsatı değerlendirmek isterseniz detayları sizinle paylaşmak isterim."
      ]
    ];

    for (let l of leads) {
      await db.query(
        "INSERT INTO leads (company_id, office_id, assigned_to, name, phone, label, score, status, source, ai_summary, whatsapp_draft) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
        [companyId, l[0], l[1], l[2], l[3], l[4], l[5], l[6], l[7], l[8], l[9]]
      );
    }

    console.log('✅ Veritabanı başarıyla DETAYLI GERÇEKÇİ demo verileriyle dolduruldu!');
    process.exit(0);
  } catch (err) {
    console.error('Seed hatası:', err);
    process.exit(1);
  }
}

seed();
