// PII Maskeleme Yardımcı Modülü

// Basit Regex desenleri (ihtiyaca göre geliştirilebilir)
const PATTERNS = {
  phone: /(\+90|0)?\s?(\d{3})\s?(\d{3})\s?(\d{2})\s?(\d{2})/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
};

const maskPII = (text, customName) => {
  if (!text) return { maskedText: text, tokenMap: new Map() };
  
  let maskedText = text;
  let counter = 0;
  const piiMap = new Map(); // NOT: Multi-tenant (çoklu istek) çakışmasını önlemek için içeriye taşındı

  // İsim maskeleme (Eğer özel olarak isim gönderildiyse)
  if (customName && customName.trim() !== '') {
    const nameRegex = new RegExp(customName, 'gi');
    maskedText = maskedText.replace(nameRegex, (match) => {
      const token = `[NAME_${counter++}]`;
      piiMap.set(token, match);
      return token;
    });

    const firstName = customName.split(' ')[0];
    if (firstName && firstName.length > 2) {
      const firstNameRegex = new RegExp(firstName, 'gi');
      maskedText = maskedText.replace(firstNameRegex, (match) => {
        const token = `[NAME_${counter++}]`;
        piiMap.set(token, match);
        return token;
      });
    }
  }

  // Telefonları maskele
  maskedText = maskedText.replace(PATTERNS.phone, (match) => {
    const token = `[PHONE_${counter++}]`;
    piiMap.set(token, match);
    return token;
  });

  // E-postaları maskele
  maskedText = maskedText.replace(PATTERNS.email, (match) => {
    const token = `[EMAIL_${counter++}]`;
    piiMap.set(token, match);
    return token;
  });

  return { maskedText, tokenMap: piiMap };
};

const unmaskPII = (text, piiMap) => {
  if (!text || !piiMap) return text;
  
  let unmaskedText = text;
  piiMap.forEach((value, token) => {
    // Regex ile tüm token eşleşmelerini (global) değiştir
    const tokenRegex = new RegExp(token.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
    unmaskedText = unmaskedText.replace(tokenRegex, value);
  });
  return unmaskedText;
};

module.exports = { maskPII, unmaskPII };
