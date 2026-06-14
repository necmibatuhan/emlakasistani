require('dotenv').config();
const db = require('./db');

async function seedLeads() {
  try {
    console.log('Lead verileri temizleniyor ve yeniden oluşturuluyor...');
    
    // Get agent
    const agentRes = await db.query("SELECT id, company_id, office_id FROM users WHERE email = 'agent@c21.com'");
    if (agentRes.rows.length === 0) {
      console.log("agent@c21.com bulunamadı. Önce demo hesapları oluşturun.");
      process.exit(1);
    }
    const agentId = agentRes.rows[0].id;
    const companyId = agentRes.rows[0].company_id;
    const officeId = agentRes.rows[0].office_id;

    // Optional: create agent2 for manager to see
    const managerRes = await db.query("SELECT company_id, office_id FROM users WHERE email = 'manager@c21.com'");
    let agent2Id;
    if (managerRes.rows.length > 0) {
      const { company_id, office_id } = managerRes.rows[0];
      const agent2Res = await db.query("SELECT id FROM users WHERE email = 'agent2@c21.com'");
      if (agent2Res.rows.length === 0) {
        const newAgent = await db.query(
          "INSERT INTO users (company_id, office_id, name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id",
          [company_id, office_id, 'Diğer Danışman', 'agent2@c21.com', 'hash', 'agent']
        );
        agent2Id = newAgent.rows[0].id;
      } else {
        agent2Id = agent2Res.rows[0].id;
      }
    }

    // Delete existing leads for these agents to prevent duplicates
    await db.query("DELETE FROM leads WHERE assigned_to = $1 OR assigned_to = $2", [agentId, agent2Id]);

    const leadsData = [
      {
        assigned_to: agentId,
        name: 'Hakan Yılmaz',
        phone: '+90 532 111 22 33',
        message: 'Merhaba, Kadıköy Bağdat Caddesi etrafında dükkan arıyorum. Kurumsal kiracılı (banka, zincir market vs) olması şart. Bütçem 2.5 Milyon USD. Amortisman süresi maksimum 15 yıl olmalı. Nakit alım yapacağım, kredi kullanmayacağım.',
        reasoning: 'Yüksek bütçeli (2.5M USD) kurumsal ticari gayrimenkul yatırımcısı. Bağdat Caddesi bölgesine odaklanıyor. Kredisiz nakit alım yapacak. ROI ve amortisman süresi 15 yıl altı şartı var. Yüksek öncelikli.',
        score: 10,
        label: 'Sıcak',
        recommended_action: 'Acilen kurumsal kiracılı alternatifleri sun ve ofise davet et.',
        whatsapp_draft: 'Merhaba Hakan Bey, Bağdat Caddesi üzerinde tam istediğiniz amortisman süresine sahip 2 harika ticari mülk portföyümüze eklendi. Detayları görüşmek üzere yarın size uygun bir saatte arayabilir miyim?',
        properties: JSON.stringify({ tags: ['Ticari', 'Yatırımcı', 'Nakit Alım', 'Bağdat Caddesi', 'Düşük Amortisman'] }),
        reminder_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'Takipte'
      },
      {
        assigned_to: agentId,
        name: 'Zeynep Akın',
        phone: '+90 544 333 44 55',
        message: 'Çekmeköy Doğa Park evlerinde 4+1 veya 5+1 kiralık villa arıyorum. 2 çocuğum var o yüzden okullara yakın ve güvenlikli bir site olması önemli. Aylık bütçem maksimum 150.000 TL. Bu ay sonuna kadar taşınmam gerekiyor.',
        reasoning: 'Kiralık villa arayışı (Çekmeköy). Aylık bütçe 150K TL. Aile oturumu için okullara yakınlık ve site içi güvenlik talep ediliyor. Aciliyet yüksek (ay sonuna kadar taşınacak).',
        score: 8,
        label: 'Sıcak',
        recommended_action: 'Doğa Park içerisindeki portföylere bakıp hemen video gönder.',
        whatsapp_draft: 'Zeynep Hanım merhaba, Çekmeköy Doğa Park bölgesindeki kiralık villa arayışınız için okullara çok yakın, güvenliği yüksek 2 alternatifimiz mevcut. Size videolarını iletebilirim.',
        properties: JSON.stringify({ tags: ['Kiralık Villa', 'Site İçi', 'Aile', 'Acil', 'Çekmeköy'] }),
        reminder_date: new Date().toISOString(),
        status: 'Takipte'
      },
      {
        assigned_to: agentId,
        name: 'Cemre Polat',
        phone: '+90 555 777 88 99',
        message: 'Beşiktaş veya Şişli taraflarında yeni bir projeden 1+1 almak istiyorum. Aslında hemen taşınmayacağım, biraz yatırım gibi düşünüyorum. Belki Airbnb yaparım. Bütçe 6-7 Milyon TL civarı. Kredi çekeceğim.',
        reasoning: 'Merkezi lokasyonda (Beşiktaş/Şişli) 1+1 sıfır veya yeni proje yatırımı planlanıyor. Airbnb potansiyeli aranıyor. Bütçe 6-7M TL. Finansman için kredi kullanılacak. Aciliyeti düşük.',
        score: 6,
        label: 'Ilık',
        recommended_action: 'Yeni projedeki 1+1 dairelerin fiyat listesini at ve ROI hesabı paylaş.',
        whatsapp_draft: 'Cemre Hanım merhabalar, Beşiktaş ve Şişli bandında yüksek Airbnb getirisi sunacak 1+1 projelerimiz hakkında hazırladığım sunumu size iletiyorum.',
        properties: JSON.stringify({ tags: ['Yatırım', 'Airbnb', '1+1', 'Kredili Alım'] }),
        reminder_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Takipte'
      },
      {
        assigned_to: agentId,
        name: 'Murat Demir',
        phone: '+90 530 999 00 11',
        message: 'Ataşehir Finans Merkezi yakınlarında 3+1 satılık ev arıyoruz. Piyasayı araştırıyorum. Hemen almak gibi bir niyetim yok, fiyatlar düşerse değerlendireceğim. Bütçe net değil.',
        reasoning: 'Ataşehir Finans Merkezi bölgesinde piyasa araştırması yapıyor. Alım niyeti zayıf/belirsiz. Fiyat düşüşü bekliyor, bütçe netleştirilmemiş.',
        score: 3,
        label: 'Soğuk',
        recommended_action: 'Haftalık bültene ekle, fiyatlar düşünce haber ver.',
        whatsapp_draft: 'Murat Bey merhabalar, Ataşehir Finans Merkezi bölgesi için piyasa araştırmanızı desteklemek adına sizi bölgesel fiyat raporu listemize ekledim. Ciddi fırsatlar oldukça bilgilendireceğim.',
        properties: JSON.stringify({ tags: ['Piyasa Araştırması', 'Ataşehir', 'Belirsiz Bütçe'] }),
        reminder_date: null,
        status: 'Takipte'
      },
      {
        assigned_to: agentId,
        name: 'Ahmet & Selin',
        phone: '+90 533 222 55 66',
        message: 'Yazlık arayışımız var. Bodrum veya Çeşme olabilir ama Yalıkavak ilk tercihimiz. Müstakil havuzlu olmalı. 1 milyon Euro bütçemiz var. Ancak tapu sorunsuz iskanlı olmalı.',
        reasoning: 'Yazlık ev arayışı (Bodrum Yalıkavak öncelikli). Müstakil havuz ve tam iskanlı tapu şartı var. Bütçe 1M Euro. Evrak hassasiyeti yüksek.',
        score: 7,
        label: 'Ilık',
        recommended_action: 'Yalıkavak bölgesindeki iskanlı lüks villaları portföyden filtrele.',
        whatsapp_draft: 'Ahmet Bey ve Selin Hanım merhaba, Yalıkavak bölgesinde müstakil havuzlu ve iskan problemi olmayan premium portföylerimizi sizin için derledim. Göz atmak ister misiniz?',
        properties: JSON.stringify({ tags: ['Yazlık', 'Müstakil Havuz', 'Bodrum', 'Yabancı Bütçe'] }),
        reminder_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Takipte'
      },
      {
        assigned_to: agent2Id,
        name: 'Kemal Sunal',
        phone: '+90 500 000 00 00',
        message: 'Nişantaşında kliniğim için geniş m2 li ofis arıyorum.',
        reasoning: 'Klinik kullanımına uygun geniş ofis arayışı.',
        score: 9,
        label: 'Sıcak',
        recommended_action: 'Nişantaşındaki ticari ofisleri sun.',
        whatsapp_draft: 'Kemal Bey merhaba, Nişantaşında kliniğiniz için uygun, asansörlü ve ferah ofis seçeneklerimiz mevcut.',
        properties: JSON.stringify({ tags: ['Ofis', 'Klinik', 'Nişantaşı'] }),
        reminder_date: new Date().toISOString(),
        status: 'Takipte'
      }
    ];

    for (let lead of leadsData) {
      await db.query(
        `INSERT INTO leads (company_id, office_id, assigned_to, source, name, phone, message, reasoning, score, label, recommended_action, whatsapp_draft, properties, reminder_date, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [companyId, officeId, lead.assigned_to, 'manual', lead.name, lead.phone, lead.message, lead.reasoning, lead.score, lead.label, lead.recommended_action, lead.whatsapp_draft, lead.properties, lead.reminder_date, lead.status]
      );
    }

    console.log('HubSpot/Zoho kalitesinde üst düzey lead verileri eklendi!');
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
}

seedLeads();
