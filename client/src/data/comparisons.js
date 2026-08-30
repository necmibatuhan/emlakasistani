const sharedRows = [
  { feature: 'Sesli nottan lead taslağı', kapora: 'Var; kullanıcı onayıyla kaydedilir', competitor: 'Satın alma öncesi ürün demosunda teyit edin' },
  { feature: 'Semantik portföy eşleştirme', kapora: 'Talep ve açıklama anlam benzerliğiyle eşleştirme', competitor: 'Kullanılan eşleştirme yöntemini teyit edin' },
  { feature: 'WhatsApp mesaj taslağı', kapora: 'Var; otomatik gönderim yerine insan onayı', competitor: 'Onay ve gönderim akışını teyit edin' },
  { feature: 'Takip planları', kapora: 'Çok adımlı, kalıcı ve zamanlanabilir planlar', competitor: 'Otomasyon ve yeniden deneme koşullarını teyit edin' },
  { feature: 'Mobil kullanım', kapora: 'Mobil öncelikli web deneyimi', competitor: 'Kendi cihazınızda deneyin' },
  { feature: 'Fiyatlandırma', kapora: 'Güncel paketler Kapora fiyat sayfasında', competitor: 'Güncel teklifi sağlayıcıdan alın' },
];

export const COMPARISONS = {
  'diger-emlak-asistanlari': {
    competitor: 'Diğer emlak asistanları',
    title: 'Diğer Emlak Asistanları ile Kapora Karşılaştırması',
    seoTitle: 'Kapora ve Diğer Emlak Asistanları',
    description: 'Kapora’yı diğer emlak asistanlarıyla sesli kayıt, yapay zekâ eşleştirme, takip planları ve mobil kullanım ölçütleri üzerinden kıyaslayın.',
    intro: 'Emlak asistanı seçerken marka iddiaları yerine danışmanın günlük işini ne kadar hızlandırdığına, veri kontrolüne ve kritik aksiyonlarda insan onayını koruyup korumadığına bakın.',
    rows: sharedRows,
  },
};
