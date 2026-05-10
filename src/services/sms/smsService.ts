import type { Language, SMSNotification } from '@/types';
import { SMS_TEMPLATES } from '@/data';

// Mock Twilio SMS service
export const smsService = {
  async send(
    to: string,
    species: string,
    harbor: string,
    price: number,
    demand: string,
    lang: Language
  ): Promise<SMSNotification> {
    const template = SMS_TEMPLATES[lang];
    const message = template(species, harbor, price, demand);

    let sid = `sms_${Date.now()}`;
    let provider = 'Mock';

    try {
      const response = await fetch('http://localhost:4000/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'u1', // In a real app, this comes from Auth state
          to,
          message,
          language: lang
        })
      });
      const data = await response.json();
      if (data.success) {
        sid = data.sid;
        provider = data.provider;
      }
    } catch (e) {
      console.warn('SMS API unreachable, falling back to local mock.', e);
    }

    const notification: SMSNotification = {
      id: sid,
      to,
      message,
      language: lang,
      status: 'sent',
      timestamp: new Date(),
      type: 'recommendation',
    };
    console.log(`[SMS Service] Dispatched via ${provider}:`, notification);
    return notification;
  },
};
