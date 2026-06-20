const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = null;
    this.fromNumber = null;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER; // Format: whatsapp:+14155238886

    if (accountSid && authToken && accountSid !== 'AC_GIRILECEK' && authToken !== 'AUTH_GIRILECEK') {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('[TwilioService] Twilio credentials not fully configured.');
    }
  }

  async sendWhatsAppMessage(to, body) {
    if (!this.client) {
      console.warn(`[TwilioService] Simulating send to ${to}: ${body}`);
      return { sid: 'simulated_sid' };
    }

    try {
      // Ensure 'to' has 'whatsapp:' prefix
      const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const fromFormatted = this.fromNumber.startsWith('whatsapp:') ? this.fromNumber : `whatsapp:${this.fromNumber}`;

      const message = await this.client.messages.create({
        body: body,
        from: fromFormatted,
        to: toFormatted
      });

      console.log(`[TwilioService] Message sent successfully to ${toFormatted}. SID: ${message.sid}`);
      return message;
    } catch (error) {
      console.error(`[TwilioService] Error sending message to ${to}:`, error);
      throw error;
    }
  }
}

module.exports = new TwilioService();
