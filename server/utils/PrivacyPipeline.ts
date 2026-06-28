const crypto = require('crypto');

/**
 * PrivacyPipeline - KVKK/GDPR Uyumlu Veri Anonimleştirme ve Geri Kazanım Sınıfı
 * 
 * DİKKAT: Bu sınıf her bir istek (request) veya işlem (session) için YENİDEN (new PrivacyPipeline())
 * oluşturulmalıdır. Aksi takdirde, eşzamanlı gelen isteklerdeki veriler birbirine karışabilir.
 */
class PrivacyPipeline {
  constructor() {
    // Maskelenen orijinal verileri güvenli bir şekilde sakladığımız bellek-içi kasa (vault)
    this.vault = new Map();
    
    // Düzenli ifadeler ile yakalanabilen temel hassas veri kalıpları
    this.patterns = [
      {
        type: 'PHONE',
        // Türkiye formatlı telefon numaralarını yakalar (Örn: +905321234567, 0532 123 45 67, 5321234567)
        regex: /(?:\+90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/g
      },
      {
        type: 'EMAIL',
        // Standart E-posta formatı
        regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
      },
      {
        type: 'TCKN',
        // 11 Haneli Türkiye Cumhuriyeti Kimlik Numarası (Basit kural)
        regex: /\b[1-9][0-9]{10}\b/g
      }
    ];
  }

  /**
   * Benzersiz bir placeholder (yer tutucu) üretir.
   * Örn: [PHONE_8f2a1b]
   */
  generatePlaceholder(type) {
    const id = crypto.randomBytes(3).toString('hex');
    return `[${type}_${id}]`;
  }

  /**
   * 1. AŞAMA: LLM'e gitmeden önce metindeki kişisel verileri maskeler (Anonymization).
   * 
   * @param {string} text - WhatsApp veya Whisper'dan gelen ham metin
   * @param {Array} customReplacements - Önceden bilinen Müşteri Adı, Adres gibi NLP/Veritabanı bazlı manuel maskelemeler
   * @returns {string} - Maskelenmiş (LLM için güvenli) metin
   */
  mask(text, customReplacements = []) {
    if (!text) return text;
    let maskedText = text;

    // 1. Statik Verileri (İsim, Bilinen Adres vb.) Manuel Maskeleme
    // Regex'in yakalayamayacağı 'Ahmet Yılmaz', 'Bağdat Caddesi No:10' gibi veriler için.
    customReplacements.forEach(({ originalValue, type }) => {
      if (maskedText.includes(originalValue)) {
        const placeholder = this.generatePlaceholder(type);
        this.vault.set(placeholder, originalValue);
        // Tüm eşleşmeleri değiştir
        maskedText = maskedText.split(originalValue).join(placeholder);
      }
    });

    // 2. Regex Tabanlı Otomatik Maskeleme (Telefon, Email, TCKN vb.)
    this.patterns.forEach(({ type, regex }) => {
      maskedText = maskedText.replace(regex, (match) => {
        const placeholder = this.generatePlaceholder(type);
        this.vault.set(placeholder, match.trim());
        return placeholder;
      });
    });

    return maskedText;
  }

  /**
   * 2. AŞAMA: LLM'den dönen yanıttaki (JSON veya Text) placeholder'ları orijinal verilerle eşleştirir (Re-identification).
   * 
   * @param {Object|string} llmResponse - Gemini API'den dönen JSON objesi veya düz metin
   * @returns {Object|string} - Orijinal verileri içeren, müşteriye veya veritabanına dönülecek yapı
   */
  unmask(llmResponse) {
    if (!llmResponse) return llmResponse;

    // İşlem kolaylığı için JSON objesini geçici olarak string'e çeviriyoruz
    const isObject = typeof llmResponse === 'object';
    let responseStr = isObject ? JSON.stringify(llmResponse) : llmResponse;

    // Vault içerisindeki her bir placeholder için tersine işlem yap
    for (const [placeholder, originalValue] of this.vault.entries()) {
      // Regex escape karakterleri ekleyerek global değişiklik yap
      const placeholderRegex = new RegExp(placeholder.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
      responseStr = responseStr.replace(placeholderRegex, originalValue);
    }

    // Bellek Sızıntısını (Memory Leak) önlemek için kasa temizlenir
    this.vault.clear();

    // Veri asıl formatında (JSON veya String) geri döndürülür
    return isObject ? JSON.parse(responseStr) : responseStr;
  }
}

module.exports = PrivacyPipeline;
