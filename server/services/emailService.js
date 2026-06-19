const nodemailer = require('nodemailer');

// Configure transport (Resend SMTP or your choice)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS || 're_dummy_key_123',
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
      return true;
    }
    await transporter.sendMail({
      from: 'Kapora <noreply@kapora.com>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

const getInactivity3DaysTemplate = (topClients, numClients, unsubscribeUrl) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background-color: #10B981; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Sizi Özledik!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <p style="color: #3f3f46; font-size: 16px; line-height: 1.5; margin-top: 0;">
        Merhaba, Kapora'ya giriş yapmayalı 3 gün oldu. Bugün sizin için öncelikli <strong>${numClients}</strong> müşteriniz görüşme bekliyor.
      </p>
      <h3 style="color: #18181b; font-size: 18px; margin-top: 30px; border-bottom: 2px solid #e4e4e7; padding-bottom: 10px;">Öne Çıkan Fırsatlar</h3>
      
      ${topClients.map(c => `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: bold; color: #0f172a; font-size: 16px;">${c.name}</div>
          <div style="background-color: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">SKOR: ${c.score}</div>
        </div>
        <div style="color: #64748b; font-size: 13px; margin-top: 8px;">
          ⏱️ En son ${c.days_since} gün önce görüşüldü
        </div>
      </div>
      `).join('')}

      <div style="text-align: center; margin-top: 40px;">
        <a href="https://kapora.app/dashboard" style="display: inline-block; background-color: #10B981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">Önceliklere Bak →</a>
      </div>
    </div>
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        Bu e-postayı almak istemiyorsanız <a href="${unsubscribeUrl}" style="color: #10B981;">bildirimleri kapatabilirsiniz</a>.
      </p>
    </div>
  </div>
</div>
`;

const getInactivity7DaysTemplate = (unsubscribeUrl) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="background-color: #18181b; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Kapora'da bu hafta neler oldu?</h1>
    </div>
    <div style="padding: 40px 30px;">
      <p style="color: #3f3f46; font-size: 16px; line-height: 1.5; margin-top: 0;">
        Bir haftadır sahadaki potansiyel müşterilerinizi Kapora'ya eklemediniz. Düzenli veri girişi, satış kapatma hızınızı doğrudan artırır.
      </p>
      
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
        <p style="color: #1e3a8a; font-size: 15px; margin: 0; font-weight: 500;">
          💡 Rakipleriniz bu hafta ortalama <strong>12 yeni müşteriyle</strong> görüştü. Potansiyel satış fırsatlarını kaçırmayın.
        </p>
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <a href="https://kapora.app/dashboard" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">Geri Dön →</a>
      </div>
    </div>
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        Bu e-postayı almak istemiyorsanız <a href="${unsubscribeUrl}" style="color: #10B981;">bildirimleri kapatabilirsiniz</a>.
      </p>
    </div>
  </div>
</div>
`;

module.exports = {
  sendEmail,
  getInactivity3DaysTemplate,
  getInactivity7DaysTemplate
};
