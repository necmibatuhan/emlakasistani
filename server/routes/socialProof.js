const express = require('express');
const router = express.Router();
const db = require('../db');

const seededEvents = [
  { name: "Ahmet Y.", city: "İstanbul", action: "premium plana geçti", time: "2 dk önce" },
  { name: "Fatma K.", city: "Ankara", action: "ilk müşterisini ekledi", time: "5 dk önce" },
  { name: "Mehmet Ö.", city: "İzmir", action: "14 günlük denemeyi başlattı", time: "8 dk önce" },
  { name: "Zeynep A.", city: "Bursa", action: "7 günlük seri yaptı ⚡", time: "12 dk önce" },
  { name: "Mustafa D.", city: "Antalya", action: "Pro Satıcı rozetini kazandı 🏆", time: "15 dk önce" },
  { name: "Ayşe S.", city: "Adana", action: "yıllık plana geçti", time: "18 dk önce" },
  { name: "Ali R.", city: "Konya", action: "ilk WhatsApp mesajını gönderdi", time: "22 dk önce" },
  { name: "Hasan T.", city: "Gaziantep", action: "portföy analizi yaptı", time: "25 dk önce" },
  { name: "Hüseyin B.", city: "Şanlıurfa", action: "yeni bir lead ekledi", time: "28 dk önce" },
  { name: "Emine E.", city: "Kocaeli", action: "premium plana geçti", time: "30 dk önce" },
  { name: "Hatice C.", city: "Mersin", action: "sesli not ile lead oluşturdu", time: "35 dk önce" },
  { name: "İsmail Ç.", city: "Diyarbakır", action: "müşteri eşleşmesi yakaladı", time: "40 dk önce" },
  { name: "Osman Y.", city: "Hatay", action: "14 günlük denemeyi başlattı", time: "45 dk önce" },
  { name: "Canan K.", city: "Kayseri", action: "ilk müşterisini ekledi", time: "50 dk önce" },
  { name: "Burak A.", city: "Eskişehir", action: "Pro Satıcı rozetini kazandı 🏆", time: "1 saat önce" },
  { name: "Selin D.", city: "Samsun", action: "premium plana geçti", time: "1 saat önce" },
  { name: "Kadir Ş.", city: "Denizli", action: "yıllık plana geçti", time: "2 saat önce" },
  { name: "Elif G.", city: "Trabzon", action: "yeni bir lead ekledi", time: "2 saat önce" },
  { name: "Murat H.", city: "Malatya", action: "sesli not ile lead oluşturdu", time: "3 saat önce" },
  { name: "Gizem V.", city: "Balıkesir", action: "portföy analizi yaptı", time: "3 saat önce" },
  { name: "Kemal U.", city: "Manisa", action: "müşteri eşleşmesi yakaladı", time: "4 saat önce" },
  { name: "Cemre N.", city: "Aydın", action: "ilk WhatsApp mesajını gönderdi", time: "4 saat önce" },
  { name: "Ozan P.", city: "Tekirdağ", action: "14 günlük denemeyi başlattı", time: "5 saat önce" },
  { name: "Derya B.", city: "Sakarya", action: "7 günlük seri yaptı ⚡", time: "5 saat önce" },
  { name: "Turan E.", city: "Muğla", action: "premium plana geçti", time: "6 saat önce" },
  { name: "Ece K.", city: "Çanakkale", action: "ilk müşterisini ekledi", time: "6 saat önce" }
];

const colors = ["#4ECDC4", "#FF6B6B", "#FFE66D", "#1A535C", "#845EC2", "#D65DB1", "#FF9671", "#FFC75F"];

function getDeterministicColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

router.get('/feed', async (req, res) => {
  try {
    const mode = process.env.SOCIAL_PROOF_MODE || 'seeded'; // 'seeded', 'real', 'hybrid'
    
    let items = [];

    if (mode === 'real' || mode === 'hybrid') {
      const realUsersRes = await db.query(`
        SELECT name, plan, created_at 
        FROM users 
        WHERE created_at > NOW() - INTERVAL '48 hours'
        ORDER BY created_at DESC
        LIMIT 10
      `);

      items = realUsersRes.rows.map(u => {
        const parts = u.name.split(' ');
        const initial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() + '.' : '';
        const displayName = parts[0] + (initial ? ' ' + initial : '');
        
        let action = "ilk müşterisini ekledi";
        if (u.plan === 'premium' || u.plan === 'pro') action = "premium plana geçti";

        return {
          id: `real-${u.name}-${Date.now()}`,
          display_name: displayName,
          city: "Türkiye",
          action: action,
          relative_time: "Yakın zamanda",
          avatar_color: getDeterministicColor(displayName)
        };
      });
    }

    if (mode === 'seeded' || (mode === 'hybrid' && items.length < 5)) {
      const randomSeed = seededEvents.sort(() => 0.5 - Math.random()).slice(0, 10);
      const mappedSeeds = randomSeed.map(s => ({
        id: `seed-${s.name}-${Date.now()}-${Math.random()}`,
        display_name: s.name,
        city: s.city,
        action: s.action,
        relative_time: s.time,
        avatar_color: getDeterministicColor(s.name)
      }));
      items = [...items, ...mappedSeeds];
    }
    
    items = items.sort(() => 0.5 - Math.random());

    res.json(items);
  } catch (err) {
    console.error('Social proof feed error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
