import { Resend } from 'resend';
import config from '../config/config';

const resend = new Resend(config.EMAIL_SERVICE_API_KEY);

export default {
  sendEmail: async (to: string[], subject: string, text: string) => {
    await resend.emails.send({
      from: 'Amandeep Singh <onboarding@resend.dev>',
      to,
      subject,
      text
    });
  }
};
