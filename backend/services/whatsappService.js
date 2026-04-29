const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

let client;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials missing. WhatsApp notifications will be logged to console instead of sent.');
}

const sendWhatsAppMessage = async (to, message) => {
  // Ensure 'to' is in WhatsApp format: 'whatsapp:+1234567890'
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  if (client && fromWhatsApp) {
    try {
      const response = await client.messages.create({
        from: fromWhatsApp,
        to: formattedTo,
        body: message
      });
      console.log(`WhatsApp message sent: ${response.sid}`);
      return response;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      // Don't throw error to avoid breaking the API flow
      return null;
    }
  } else {
    console.log(`[MOCK WHATSAPP] To: ${formattedTo}\nMessage:\n${message}`);
    return { sid: 'mock_sid' };
  }
};

module.exports = { sendWhatsAppMessage };
